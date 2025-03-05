import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UTIPrediction = {
  id: string;
  created_at: string;
  age: number;
  sex: string;
  previous_uti: string;
  diabetes: string;
  dysuria: string;
  frequency: string;
  lower_abdominal_pain: string;
  fever: string;
  leukocyte_esterase: string | null;
  nitrite: string | null;
  wbc_count: number | null;
  hematuria: string | null;
  urine_culture: string | null;
  rf_prediction: string;
  rf_probability: number;
  xgb_prediction: string;
  xgb_probability: number;
  user_id: string | null;
};

export async function savePrediction(data: any, result: any, userId?: string | null) {
  try {
    // Prepare the data for insertion
    const predictionData = {
      age: data.Age,
      sex: data.Sex,
      previous_uti: data.Previous_UTI,
      diabetes: data.Diabetes,
      dysuria: data.Dysuria,
      frequency: data.Frequency,
      lower_abdominal_pain: data.Lower_Abdominal_Pain,
      fever: data.Fever,
      leukocyte_esterase: data.Leukocyte_Esterase || null,
      nitrite: data.Nitrite || null,
      wbc_count: data.WBC_Count || null,
      hematuria: data.Hematuria || null,
      urine_culture: data.Urine_Culture || null,
      rf_prediction: result.random_forest.prediction,
      rf_probability: result.random_forest.probability,
      xgb_prediction: result.xgboost.prediction,
      xgb_probability: result.xgboost.probability,
      user_id: userId || null
    };

    // Insert data with error handling
    const { data: insertData, error } = await supabase
      .from('uti_predictions')
      .insert(predictionData)
      .select();

    if (error) {
      console.error('Error saving prediction to Supabase:', error);
      return null;
    }

    return insertData?.[0] || null;
  } catch (error) {
    console.error('Error in savePrediction:', error);
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  try {
    if (!userId) {
      console.error('No user ID provided');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function getAllPredictions(): Promise<UTIPrediction[]> {
  try {
    // First check if the user is an admin using user metadata
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('User not authenticated:', userError);
      return [];
    }
    
    // Check if user is admin directly from metadata
    const userRole = userData.user.user_metadata?.role;
    if (userRole !== 'admin' && userRole !== 'doctor') {
      console.error('User not authorized to access all predictions');
      return [];
    }
    
    // Use a direct query
    const { data, error } = await supabase
      .from('uti_predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all predictions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllPredictions:', error);
    return [];
  }
}