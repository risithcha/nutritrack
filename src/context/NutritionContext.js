import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const NutritionContext = createContext();

// Calculate how many calories the user needs based on their profile
const calculateTDEE = (userProfile) => {
  // Using the Mifflin-St Jeor formula (works with pounds and inches)
  const { gender, weight, height, age, activityLevel } = userProfile;
  
  let bmr;
  if (gender === 'male') {
    bmr = 4.536 * weight + 15.875 * height - 5 * age + 5;
  } else {
    bmr = 4.536 * weight + 15.875 * height - 5 * age - 161;
  }
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

const initialState = {
  // Track what the user ate today
  dailyNutrition: {
    consumed: 0,
    target: 1898, // This gets updated when we load the user's profile
    remaining: 1898,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  },
  
  // User's personal info (age, weight, activity level, etc.)
  userProfile: {
    gender: 'Female',
    weight: 65,
    height: 165,
    age: 30,
    activityLevel: 'moderate',
  },
  
  // AI-generated meal suggestions
  mealPlan: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  },
  
  // List of foods the user has scanned
  scannedFoods: [],
  
  // When we last reset the daily tracking (for midnight resets)
  lastResetDate: null,
};

const nutritionReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_DAILY_NUTRITION':
      const newConsumed = action.payload.consumed || state.dailyNutrition.consumed;
      const updatedTarget = action.payload.target || state.dailyNutrition.target;
      return {
        ...state,
        dailyNutrition: {
          ...state.dailyNutrition,
          ...action.payload,
          remaining: updatedTarget - newConsumed,
        },
      };
      
    case 'ADD_FOOD':
      const newFood = action.payload;
      const updatedConsumed = state.dailyNutrition.consumed + newFood.calories;
      const updatedProtein = state.dailyNutrition.protein + newFood.protein;
      const updatedCarbs = state.dailyNutrition.carbs + newFood.carbs;
      const updatedFat = state.dailyNutrition.fat + newFood.fat;
      const updatedFiber = state.dailyNutrition.fiber + (newFood.fiber || 0);
      const updatedSugar = state.dailyNutrition.sugar + (newFood.sugar || 0);
      const updatedSodium = state.dailyNutrition.sodium + (newFood.sodium || 0);
      
      return {
        ...state,
        dailyNutrition: {
          ...state.dailyNutrition,
          consumed: updatedConsumed,
          remaining: state.dailyNutrition.target - updatedConsumed,
          protein: updatedProtein,
          carbs: updatedCarbs,
          fat: updatedFat,
          fiber: updatedFiber,
          sugar: updatedSugar,
          sodium: updatedSodium,
        },
        scannedFoods: [...state.scannedFoods, newFood],
      };
      
    case 'UPDATE_USER_PROFILE':
      const updatedProfile = {
        ...state.userProfile,
        ...action.payload,
      };
      const newTarget = calculateTDEE(updatedProfile);
      return {
        ...state,
        userProfile: updatedProfile,
        dailyNutrition: {
          ...state.dailyNutrition,
          target: newTarget,
          remaining: newTarget - state.dailyNutrition.consumed,
        },
      };
      
    case 'UPDATE_MEAL_PLAN':
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          ...action.payload,
        },
      };
      
    case 'RESET_DAILY_NUTRITION':
      return {
        ...state,
        dailyNutrition: {
          ...initialState.dailyNutrition,
          target: state.dailyNutrition.target,
          remaining: state.dailyNutrition.target,
        },
        scannedFoods: [],
        lastResetDate: new Date().toISOString(),
      };
      
    case 'LOAD_FIRESTORE_DATA':
      return {
        ...state,
        ...action.payload,
      };
      
    case 'UPDATE_LAST_RESET_DATE':
      return {
        ...state,
        lastResetDate: action.payload,
      };
      
    default:
      return state;
  }
};

export const NutritionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(nutritionReducer, initialState);
  const { user } = useAuth();

  // Get all the user's data from Firestore when they log in
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          console.log('Loading user data from Firestore for user:', user.uid);
          
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data from Firestore:', userData);
            
            // Pull all the data from Firestore
            const firestoreData = {
              userProfile: userData.profile || initialState.userProfile,
              dailyNutrition: userData.dailyNutrition || initialState.dailyNutrition,
              mealPlan: userData.mealPlan || initialState.mealPlan,
              scannedFoods: userData.scannedFoods || [],
              lastResetDate: userData.lastResetDate || null,
            };
            
            // Load profile first so we can calculate the right calorie target
            if (userData.profile) {
              dispatch({ type: 'UPDATE_USER_PROFILE', payload: userData.profile });
            }
            
            // Then load daily nutrition with the correct target
            if (userData.dailyNutrition) {
              dispatch({ type: 'UPDATE_DAILY_NUTRITION', payload: userData.dailyNutrition });
            }
            
            // Load everything else
            if (userData.mealPlan) {
              dispatch({ type: 'UPDATE_MEAL_PLAN', payload: userData.mealPlan });
            }
            
            if (userData.scannedFoods) {
              // Put the scanned foods back in state
              dispatch({ type: 'LOAD_FIRESTORE_DATA', payload: { scannedFoods: userData.scannedFoods } });
            }
            
            if (userData.lastResetDate) {
              dispatch({ type: 'UPDATE_LAST_RESET_DATE', payload: userData.lastResetDate });
            }
            
            console.log('User data loaded successfully from Firestore');
          } else {
            console.log('User document does not exist, creating initial data');
            // Make a new user document with default stuff
            await setDoc(doc(db, 'users', user.uid), {
              profile: initialState.userProfile,
              dailyNutrition: initialState.dailyNutrition,
              mealPlan: initialState.mealPlan,
              scannedFoods: [],
              lastResetDate: null,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.log('Error loading user data from Firestore:', error);
        }
      }
    };
    
    loadUserData();
  }, [user?.uid]);

  // Reset the daily tracking at midnight
  useEffect(() => {
    const checkAndResetDaily = async () => {
      if (!user?.uid) return;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // See if we need to reset for a new day
      if (state.lastResetDate !== today) {
        console.log('Resetting daily nutrition for new day');
        
        const resetData = {
          dailyNutrition: {
            ...initialState.dailyNutrition,
            target: state.dailyNutrition.target,
            remaining: state.dailyNutrition.target,
          },
          scannedFoods: [],
          lastResetDate: today,
        };
        
        // Update the app state
        dispatch({ type: 'RESET_DAILY_NUTRITION' });
        dispatch({ type: 'UPDATE_LAST_RESET_DATE', payload: today });
        
        // Put it in Firestore
        try {
          await updateDoc(doc(db, 'users', user.uid), resetData);
          console.log('Daily nutrition reset and saved to Firestore');
        } catch (error) {
          console.log('Error resetting daily nutrition in Firestore:', error);
        }
      }
    };
    
    checkAndResetDaily();
  }, [user?.uid, state.lastResetDate]);

  // Keep Firestore updated whenever something changes
  useEffect(() => {
    const saveDataToFirestore = async () => {
      if (!user?.uid) return;
      
      try {
        const dataToSave = {
          profile: state.userProfile,
          dailyNutrition: state.dailyNutrition,
          mealPlan: state.mealPlan,
          scannedFoods: state.scannedFoods,
          lastResetDate: state.lastResetDate,
          updatedAt: new Date().toISOString(),
        };
        
        await updateDoc(doc(db, 'users', user.uid), dataToSave);
        console.log('Data saved to Firestore successfully');
      } catch (error) {
        console.log('Error saving data to Firestore:', error);
      }
    };
    
    // Wait a second before saving to avoid spamming Firestore
    const timeoutId = setTimeout(saveDataToFirestore, 1000);
    return () => clearTimeout(timeoutId);
  }, [user?.uid, state.userProfile, state.dailyNutrition, state.mealPlan, state.scannedFoods, state.lastResetDate]);

  const updateUserProfile = async (profile) => {
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: profile });
    
    // Save it right away
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          profile: profile,
          updatedAt: new Date().toISOString(),
        });
        console.log('User profile saved to Firestore');
      } catch (error) {
        console.log('Error saving profile to Firestore:', error);
      }
    }
  };

  const addFoodToHistory = async (food) => {
    if (user?.uid) {
      try {
        console.log('Saving food to history:', food);
        
        await updateDoc(doc(db, 'users', user.uid), {
          foodHistory: arrayUnion(food),
          updatedAt: new Date().toISOString(),
        });
        
        console.log('Food saved to history successfully');
      } catch (error) {
        console.log('Error saving food to Firestore history:', error);
      }
    } else {
      console.log('No user UID available for saving food to history');
    }
  };

  const saveDailyNutritionToFirestore = async (dailyNutrition) => {
    if (user?.uid) {
      try {
        console.log('Saving daily nutrition to Firestore:', dailyNutrition);
        
        await updateDoc(doc(db, 'users', user.uid), {
          dailyNutrition: dailyNutrition,
          updatedAt: new Date().toISOString(),
        });
        
        console.log('Daily nutrition saved to Firestore successfully');
      } catch (error) {
        console.log('Error saving daily nutrition to Firestore:', error);
      }
    } else {
      console.log('No user UID available for saving daily nutrition');
    }
  };

  const updateMealPlan = async (mealPlan) => {
    dispatch({ type: 'UPDATE_MEAL_PLAN', payload: mealPlan });
    
    // Save it right away
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          mealPlan: mealPlan,
          updatedAt: new Date().toISOString(),
        });
        console.log('Meal plan saved to Firestore');
      } catch (error) {
        console.log('Error saving meal plan to Firestore:', error);
      }
    }
  };

  const resetDailyNutrition = async () => {
    const today = new Date().toISOString();
    
    dispatch({ type: 'RESET_DAILY_NUTRITION' });
    dispatch({ type: 'UPDATE_LAST_RESET_DATE', payload: today });
    
    // Save it right away
    if (user?.uid) {
      try {
        const resetData = {
          dailyNutrition: {
            ...initialState.dailyNutrition,
            target: state.dailyNutrition.target,
            remaining: state.dailyNutrition.target,
          },
          scannedFoods: [],
          lastResetDate: today,
          updatedAt: new Date().toISOString(),
        };
        
        await updateDoc(doc(db, 'users', user.uid), resetData);
        console.log('Daily nutrition reset and saved to Firestore');
      } catch (error) {
        console.log('Error resetting daily nutrition in Firestore:', error);
      }
    }
  };

  const value = {
    state,
    dispatch,
    updateDailyNutrition: (data) => dispatch({ type: 'UPDATE_DAILY_NUTRITION', payload: data }),
    addFood: (food) => {
      // Add up all the nutrition values
      const newConsumed = state.dailyNutrition.consumed + food.calories;
      const updatedProtein = state.dailyNutrition.protein + food.protein;
      const updatedCarbs = state.dailyNutrition.carbs + food.carbs;
      const updatedFat = state.dailyNutrition.fat + food.fat;
      const updatedFiber = state.dailyNutrition.fiber + (food.fiber || 0);
      const updatedSugar = state.dailyNutrition.sugar + (food.sugar || 0);
      const updatedSodium = state.dailyNutrition.sodium + (food.sodium || 0);
      
      const updatedDailyNutrition = {
        ...state.dailyNutrition,
        consumed: newConsumed,
        remaining: state.dailyNutrition.target - newConsumed,
        protein: updatedProtein,
        carbs: updatedCarbs,
        fat: updatedFat,
        fiber: updatedFiber,
        sugar: updatedSugar,
        sodium: updatedSodium,
      };
      
      // Update the app state
      dispatch({ type: 'ADD_FOOD', payload: food });
      
      // Save the food to history
      addFoodToHistory(food);
      
      // Keep Firestore updated
      saveDailyNutritionToFirestore(updatedDailyNutrition);
    },
    updateUserProfile,
    updateMealPlan,
    resetDailyNutrition,
  };

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};
