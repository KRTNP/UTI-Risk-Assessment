import os
import pickle
import logging
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from dotenv import load_dotenv
import psycopg2
from psycopg2 import pool
from functools import lru_cache

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection pool
try:
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        1, 20,
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    logger.info("Database connection pool created successfully")
except Exception as e:
    logger.error(f"Error creating database connection pool: {e}")
    connection_pool = None

# Load ML models
def load_model(model_path):
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        logger.info(f"Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        logger.error(f"Error loading model from {model_path}: {e}")
        return None

# Load models at startup
try:
    rf_model = load_model(os.getenv("MODEL_PATH_RF"))
    xgb_model = load_model(os.getenv("MODEL_PATH_XGB"))
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    rf_model = None
    xgb_model = None

# Data validation function
def validate_input(data):
    required_fields = [
        'Age', 'Sex', 'Previous_UTI', 'Diabetes', 
        'Dysuria', 'Frequency', 'Lower_Abdominal_Pain', 'Fever'
    ]
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate data types and values
    if not isinstance(data['Age'], (int, float)) or data['Age'] < 0 or data['Age'] > 120:
        return False, "Age must be a number between 0 and 120"
    
    if data['Sex'] not in ['Male', 'Female']:
        return False, "Sex must be 'Male' or 'Female'"
    
    binary_fields = ['Previous_UTI', 'Diabetes', 'Dysuria', 'Frequency', 
                     'Lower_Abdominal_Pain', 'Fever', 'Hematuria']
    for field in binary_fields:
        if field in data and data[field] not in ['Yes', 'No']:
            return False, f"{field} must be 'Yes' or 'No'"
    
    lab_fields = ['Leukocyte_Esterase', 'Nitrite', 'Urine_Culture']
    for field in lab_fields:
        if field in data and data[field] not in ['Positive', 'Negative']:
            return False, f"{field} must be 'Positive' or 'Negative'"
    
    if 'WBC_Count' in data and not isinstance(data['WBC_Count'], (int, float)):
        return False, "WBC_Count must be a number"
    
    return True, "Validation successful"

# Preprocess input data
def preprocess_data(data):
    # Handle missing values with defaults
    defaults = {
        'Leukocyte_Esterase': 'Negative',
        'Nitrite': 'Negative',
        'WBC_Count': 0,
        'Hematuria': 'No',
        'Urine_Culture': 'Negative'
    }
    
    for key, default_value in defaults.items():
        if key not in data or data[key] is None:
            data[key] = default_value
    
    # Convert to DataFrame
    df = pd.DataFrame([data])
    
    return df

# Cache predictions to improve performance
@lru_cache(maxsize=128)
def cached_predict(model, data_tuple):
    # Convert tuple back to DataFrame
    data_dict = json.loads(data_tuple)
    df = pd.DataFrame([data_dict])
    
    # Make prediction
    prediction = model.predict(df)
    probability = model.predict_proba(df)[0]
    
    return {
        'prediction': int(prediction[0]),
        'probability': float(probability[1]) if prediction[0] == 1 else float(probability[0])
    }

# Save prediction to database
def save_prediction(data, rf_result, xgb_result):
    if connection_pool is None:
        logger.warning("Database connection pool not available, skipping save")
        return
    
    try:
        conn = connection_pool.getconn()
        cursor = conn.cursor()
        
        # Create table if not exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS uti_predictions (
                id SERIAL PRIMARY KEY,
                age INTEGER,
                sex VARCHAR(10),
                previous_uti VARCHAR(5),
                diabetes VARCHAR(5),
                dysuria VARCHAR(5),
                frequency VARCHAR(5),
                lower_abdominal_pain VARCHAR(5),
                fever VARCHAR(5),
                leukocyte_esterase VARCHAR(10),
                nitrite VARCHAR(10),
                wbc_count FLOAT,
                hematuria VARCHAR(5),
                urine_culture VARCHAR(10),
                rf_prediction INTEGER,
                rf_probability FLOAT,
                xgb_prediction INTEGER,
                xgb_probability FLOAT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert prediction
        cursor.execute('''
            INSERT INTO uti_predictions (
                age, sex, previous_uti, diabetes, dysuria, frequency, 
                lower_abdominal_pain, fever, leukocyte_esterase, nitrite, 
                wbc_count, hematuria, urine_culture, rf_prediction, 
                rf_probability, xgb_prediction, xgb_probability
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['Age'], data['Sex'], data['Previous_UTI'], data['Diabetes'],
            data['Dysuria'], data['Frequency'], data['Lower_Abdominal_Pain'], data['Fever'],
            data.get('Leukocyte_Esterase', 'Negative'), data.get('Nitrite', 'Negative'),
            data.get('WBC_Count', 0), data.get('Hematuria', 'No'), data.get('Urine_Culture', 'Negative'),
            rf_result['prediction'], rf_result['probability'],
            xgb_result['prediction'], xgb_result['probability']
        ))
        
        conn.commit()
        logger.info("Prediction saved to database")
    except Exception as e:
        logger.error(f"Error saving prediction to database: {e}")
    finally:
        if conn:
            cursor.close()
            connection_pool.putconn(conn)

@app.route('/api/predict', methods=['POST'])
def predict():
    if rf_model is None or xgb_model is None:
        return jsonify({'error': 'Models not loaded properly'}), 500
    
    try:
        # Get input data
        data = request.json
        
        # Validate input data
        is_valid, message = validate_input(data)
        if not is_valid:
            logger.warning(f"Invalid input data: {message}")
            return jsonify({'error': message}), 400
        
        # Preprocess data
        df = preprocess_data(data)
        
        # Convert DataFrame to tuple for caching
        data_tuple = json.dumps(data, sort_keys=True)
        
        # Make predictions
        rf_result = cached_predict(rf_model, data_tuple)
        xgb_result = cached_predict(xgb_model, data_tuple)
        
        # Map predictions to labels
        label_mapping = {0: 'No UTI', 1: 'UTI'}
        
        result = {
            'random_forest': {
                'prediction': label_mapping[rf_result['prediction']],
                'probability': round(rf_result['probability'] * 100, 2)
            },
            'xgboost': {
                'prediction': label_mapping[xgb_result['prediction']],
                'probability': round(xgb_result['probability'] * 100, 2)
            }
        }
        
        # Save prediction to database
        save_prediction(data, rf_result, xgb_result)
        
        logger.info(f"Prediction made successfully: {result}")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error making prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    if rf_model is None or xgb_model is None:
        return jsonify({'error': 'Models not loaded properly'}), 500
    
    try:
        # Get input data
        batch_data = request.json
        
        if not isinstance(batch_data, list):
            return jsonify({'error': 'Batch data must be a list'}), 400
        
        results = []
        
        for data in batch_data:
            # Validate input data
            is_valid, message = validate_input(data)
            if not is_valid:
                results.append({'error': message})
                continue
            
            # Preprocess data
            df = preprocess_data(data)
            
            # Convert DataFrame to tuple for caching
            data_tuple = json.dumps(data, sort_keys=True)
            
            # Make predictions
            rf_result = cached_predict(rf_model, data_tuple)
            xgb_result = cached_predict(xgb_model, data_tuple)
            
            # Map predictions to labels
            label_mapping = {0: 'No UTI', 1: 'UTI'}
            
            result = {
                'input': data,
                'random_forest': {
                    'prediction': label_mapping[rf_result['prediction']],
                    'probability': round(rf_result['probability'] * 100, 2)
                },
                'xgboost': {
                    'prediction': label_mapping[xgb_result['prediction']],
                    'probability': round(xgb_result['probability'] * 100, 2)
                }
            }
            
            # Save prediction to database
            save_prediction(data, rf_result, xgb_result)
            
            results.append(result)
        
        logger.info(f"Batch prediction made successfully for {len(results)} records")
        return jsonify(results)
    
    except Exception as e:
        logger.error(f"Error making batch prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    health = {
        'status': 'healthy',
        'models': {
            'random_forest': rf_model is not None,
            'xgboost': xgb_model is not None
        },
        'database': connection_pool is not None
    }
    return jsonify(health)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)