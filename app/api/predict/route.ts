import { NextRequest, NextResponse } from 'next/server';
import { supabase, savePrediction } from '@/lib/supabase';

// Mock function to simulate model prediction
function predictUTI(data: any) {
  // Extract features from the input data
  const {
    Age,
    Sex,
    Previous_UTI,
    Diabetes,
    Dysuria,
    Frequency,
    Lower_Abdominal_Pain,
    Fever,
    Leukocyte_Esterase,
    Nitrite,
    WBC_Count,
    Hematuria,
    Urine_Culture,
  } = data;

  // Calculate risk factors
  const hasSevereSymptoms = 
    Dysuria === "Yes" && 
    Frequency === "Yes" && 
    (Lower_Abdominal_Pain === "Yes" || Fever === "Yes");
  
  const hasRiskFactors = 
    Previous_UTI === "Yes" || 
    Diabetes === "Yes" || 
    Sex === "Female";
  
  // Calculate lab indicators
  const hasPositiveLabs = 
    Leukocyte_Esterase === "Positive" || 
    Nitrite === "Positive" || 
    (WBC_Count && WBC_Count > 10) || 
    Hematuria === "Yes" || 
    Urine_Culture === "Positive";
  
  // Calculate probability based on symptoms, risk factors, and lab results
  let rfProbability = 0;
  let xgbProbability = 0;
  
  if (hasSevereSymptoms && hasRiskFactors && hasPositiveLabs) {
    rfProbability = 0.95;
    xgbProbability = 0.97;
  } else if (hasSevereSymptoms && hasRiskFactors) {
    rfProbability = 0.85;
    xgbProbability = 0.88;
  } else if (hasSevereSymptoms && hasPositiveLabs) {
    rfProbability = 0.80;
    xgbProbability = 0.82;
  } else if (hasRiskFactors && hasPositiveLabs) {
    rfProbability = 0.75;
    xgbProbability = 0.78;
  } else if (hasSevereSymptoms) {
    rfProbability = 0.65;
    xgbProbability = 0.68;
  } else if (hasPositiveLabs) {
    rfProbability = 0.60;
    xgbProbability = 0.62;
  } else if (hasRiskFactors) {
    rfProbability = 0.35;
    xgbProbability = 0.38;
  } else {
    rfProbability = 0.15;
    xgbProbability = 0.18;
  }
  
  // Add some randomness to simulate model variance
  rfProbability = Math.min(0.95, Math.max(0.05, rfProbability + (Math.random() * 0.1 - 0.05)));
  xgbProbability = Math.min(0.95, Math.max(0.05, xgbProbability + (Math.random() * 0.1 - 0.05)));
  
  return {
    random_forest: {
      prediction: rfProbability > 0.5 ? "UTI" : "No UTI",
      probability: Math.round(rfProbability * 100)
    },
    xgboost: {
      prediction: xgbProbability > 0.5 ? "UTI" : "No UTI",
      probability: Math.round(xgbProbability * 100)
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate input data (simplified validation)
    if (!data.Age || !data.Sex || !data.Dysuria || !data.Frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user ID from session if available
    let userId = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData.session?.user?.id;
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      // Continue without user ID
    }

    // In a real application, you would load your model and run inference here
    // For demo purposes, we'll use our mock prediction function
    const prediction = predictUTI(data);

    // Save prediction to Supabase
    try {
      await savePrediction(data, prediction, userId);
    } catch (saveError) {
      console.error("Error saving prediction:", saveError);
      // Continue even if saving fails
    }

    // Return the prediction result
    return NextResponse.json({
      success: true,
      prediction
    });

  } catch (error) {
    console.error("Error processing prediction:", error);
    return NextResponse.json(
      { error: "Failed to process prediction" },
      { status: 500 }
    );
  }
}