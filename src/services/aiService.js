import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { API_CONFIG, FOOD_ANALYSIS_PROMPTS, ERROR_MESSAGES } from '../config/api';

class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(API_CONFIG.googleAI.apiKey);
        this.model = this.genAI.getGenerativeModel({ 
            model: API_CONFIG.googleAI.model,
            generationConfig: {
                maxOutputTokens: API_CONFIG.googleAI.maxTokens,
                temperature: API_CONFIG.googleAI.temperature,
            },
        });
    }

    // Turn the image into base64 so we can send it to the AI
    async imageToBase64(imageUri) {
        try {
            // Make the image smaller and compress it so it works better with the API
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 800 } }],
                { 
                    compress: 0.8, 
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true 
                }
            );
            
            return manipulatedImage.base64;
        } catch (error) {
            console.error('Error converting image to base64:', error);
            throw new Error(ERROR_MESSAGES.invalidImage);
        }
    }

    // Use AI to figure out what food is in the image and get nutrition info
    async analyzeFoodImage(imageUri) {
        try {
            console.log('Starting food analysis...');
            
            // Turn the image into base64
            const base64Image = await this.imageToBase64(imageUri);
            
            // Set up the image for the AI
            const imagePart = {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg'
                }
            };

            // First, check if there's actually food in the image
            const foodCheckResult = await this.model.generateContent([
                'Analyze this image and determine if it contains food or drink items. Return only "food" if it contains edible items, or "not_food" if it does not contain food or drink.',
                imagePart
            ]);
            
            const foodCheck = foodCheckResult.response.text().trim().toLowerCase();
            console.log('Food check result:', foodCheck);
            
            if (foodCheck === 'not_food' || foodCheck.includes('not_food')) {
                throw new Error('NOT_FOOD');
            }

            // Get the nutrition info
            const nutritionResult = await this.model.generateContent([
                FOOD_ANALYSIS_PROMPTS.nutrition,
                imagePart
            ]);
            
            const nutritionResponse = nutritionResult.response.text();
            console.log('Nutrition analysis response:', nutritionResponse);
            
            // Turn the AI response into usable data
            let nutritionData;
            try {
                // Pull out the JSON from the response (in case there's extra text)
                const jsonMatch = nutritionResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    nutritionData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.error('Error parsing nutrition data:', parseError);
                throw new Error('Failed to parse nutrition data');
            }

            // Make sure we got the important stuff
            if (!nutritionData.name || !nutritionData.calories) {
                throw new Error('Incomplete nutrition data received');
            }

            // Figure out what meal this is (breakfast, lunch, etc.)
            const mealTypeResult = await this.model.generateContent([
                FOOD_ANALYSIS_PROMPTS.mealType,
                imagePart
            ]);
            
            const mealType = mealTypeResult.response.text().trim().toLowerCase();

            // Rate how healthy this food is (1-10)
            const healthScoreResult = await this.model.generateContent([
                FOOD_ANALYSIS_PROMPTS.healthScore,
                imagePart
            ]);
            
            const healthScore = parseInt(healthScoreResult.response.text().trim()) || 5;

            return {
                ...nutritionData,
                mealType,
                healthScore,
                imageUri,
                timestamp: new Date().toISOString(),
                confidence: nutritionData.confidence || 70,
            };

        } catch (error) {
            console.error('Food analysis error:', error);
            
            if (error.message === 'NOT_FOOD') {
                throw new Error('NOT_FOOD');
            } else if (error.message.includes('API key')) {
                throw new Error(ERROR_MESSAGES.apiKeyMissing);
            } else if (error.message.includes('network')) {
                throw new Error(ERROR_MESSAGES.networkError);
            } else if (error.message.includes('timeout')) {
                throw new Error(ERROR_MESSAGES.analysisTimeout);
            } else {
                throw new Error(ERROR_MESSAGES.imageAnalysisFailed);
            }
        }
    }

    // Make a meal plan based on the user's info and what they like
    async generateMealPlan(userProfile, preferences = {}) {
        try {
            const prompt = `Generate a personalized meal plan for a ${userProfile.age}-year-old ${userProfile.gender.toLowerCase()} with the following characteristics:
            - Weight: ${userProfile.weight}kg
            - Height: ${userProfile.height}cm
            - Activity Level: ${userProfile.activityLevel}
            - Daily Calorie Target: ${this.calculateTDEE(userProfile)} calories
            
            Preferences: ${JSON.stringify(preferences)}
            
            Please provide a meal plan in JSON format with the following structure:
            {
                "breakfast": [
                    {
                        "item": "meal name",
                        "calories": number,
                        "protein": number,
                        "carbs": number,
                        "fat": number,
                        "description": "brief description"
                    }
                ],
                "lunch": [...],
                "dinner": [...],
                "snacks": [...]
            }
            
            Make sure the total daily calories are close to the target and meals are balanced.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            // Turn the AI response into usable data
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse meal plan');
            }

        } catch (error) {
            console.error('Meal plan generation error:', error);
            throw new Error('Failed to generate meal plan');
        }
    }

    // Figure out how many calories the user needs
    calculateTDEE(userProfile) {
        const { gender, weight, height, age, activityLevel } = userProfile;
        
        // Using the Mifflin-St Jeor formula
        let bmr;
        if (gender === 'Male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            veryActive: 1.9,
        };
        
        return Math.round(bmr * activityMultipliers[activityLevel]);
    }

    // Give the user some tips about the food they scanned
    async getNutritionTips(foodData) {
        try {
            const prompt = `Based on this food analysis:
            - Food: ${foodData.name}
            - Calories: ${foodData.calories}
            - Protein: ${foodData.protein}g
            - Carbs: ${foodData.carbs}g
            - Fat: ${foodData.fat}g
            - Health Score: ${foodData.healthScore}/10
            
            Provide 2-3 brief nutrition tips or suggestions for this food. Keep each tip under 50 words.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().split('\n').filter(tip => tip.trim());

        } catch (error) {
            console.error('Nutrition tips error:', error);
            return ['Consider portion size for balanced nutrition.', 'Pair with vegetables for a complete meal.'];
        }
    }
}

export default new AIService();
