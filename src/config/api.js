import { GOOGLE_AI_API_KEY } from '@env';

// API Configuration
export const API_CONFIG = {
  googleAI: {
    apiKey: GOOGLE_AI_API_KEY,
    model: 'gemini-1.5-flash',
    maxTokens: 2048,
    temperature: 0.3,
  },
  edamam: {
    baseUrl: 'https://api.edamam.com/api/nutrition-data',
    appId: 'your_edamam_app_id', // Optional: for more accurate nutrition data
    appKey: 'your_edamam_app_key', // Optional: for more accurate nutrition data
  }
};

// Food Analysis Prompts
export const FOOD_ANALYSIS_PROMPTS = {
  nutrition: `Analyze this food image and provide detailed nutrition information in JSON format. Include:
  - Food name (be specific)
  - Estimated calories
  - Protein (grams)
  - Carbohydrates (grams) 
  - Fat (grams)
  - Fiber (grams)
  - Sugar (grams)
  - Sodium (mg)
  - Serving size estimate
  - Confidence level (0-100)
  
  Format the response as valid JSON with these exact field names:
  {
    "name": "food name",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number,
    "sodium": number,
    "servingSize": "description",
    "confidence": number
  }`,
  
  mealType: `Analyze this food image and determine the most likely meal type. Return only one of these options:
  - breakfast
  - lunch
  - dinner
  - snack
  - dessert`,
  
  healthScore: `Rate this food's healthiness on a scale of 1-10, where:
  1 = Very unhealthy (high in processed ingredients, sugar, unhealthy fats)
  10 = Very healthy (whole foods, balanced nutrients, low in processed ingredients)
  
  Return only the number.`
};

// Error Messages
export const ERROR_MESSAGES = {
  apiKeyMissing: 'Google AI API key is not configured',
  networkError: 'Network error. Please check your connection and try again.',
  analysisTimeout: 'Analysis timed out. Please try again.',
  imageAnalysisFailed: 'Failed to analyze food image. Please try again.',
  invalidImage: 'Invalid image format. Please try again.',
  notFood: 'This image does not appear to contain food. Please take a photo of food or drink items.',
  quotaExceeded: 'API quota exceeded. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  foodAnalyzed: 'Food analyzed successfully!',
  mealPlanGenerated: 'Meal plan generated successfully!',
  profileUpdated: 'Profile updated successfully!',
};
