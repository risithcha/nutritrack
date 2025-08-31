import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNutrition } from '../context/NutritionContext';
import aiService from '../services/aiService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/api';

const MealPlanScreen = ({ navigation }) => {
    const { state, addFood, updateMealPlan } = useNutrition();
    const { mealPlan } = state;
    const [selectedMeal, setSelectedMeal] = useState(null);

    const mealCategories = [
        { key: 'breakfast', title: 'Breakfast', icon: 'sunny' },
        { key: 'lunch', title: 'Lunch', icon: 'restaurant' },
        { key: 'dinner', title: 'Dinner', icon: 'moon' },
        { key: 'snacks', title: 'Snacks', icon: 'nutrition' },
    ];

    const generateNewMealPlan = async () => {
        try {
            // Let the user know we're working on it
            Alert.alert('Generating Meal Plan', 'Please wait while AI creates your personalized meal plan...');
            
            // Use AI to make a meal plan
            const newMealPlan = await aiService.generateMealPlan(state.userProfile);
            
            // Give each meal a unique ID so the app can track them
            const processedMealPlan = {};
            Object.keys(newMealPlan).forEach(category => {
                processedMealPlan[category] = newMealPlan[category].map((meal, index) => ({
                    ...meal,
                    id: Date.now() + index, // Make sure each meal has a unique ID
                }));
            });
            
            // Save the new meal plan
            updateMealPlan(processedMealPlan);
            
            Alert.alert('Success', SUCCESS_MESSAGES.mealPlanGenerated);
            
        } catch (error) {
            console.error('Meal plan generation error:', error);
            
            // Use a backup meal plan if the AI fails
            const mockMealPlan = {
                breakfast: [
                    {
                        id: Date.now() + 1,
                        item: 'Oatmeal with Berries and Nuts',
                        calories: 350,
                        protein: 15,
                        carbs: 50,
                        fat: 12,
                    },
                    {
                        id: Date.now() + 2,
                        item: 'Greek Yogurt with Honey',
                        calories: 200,
                        protein: 20,
                        carbs: 25,
                        fat: 5,
                    }
                ],
                lunch: [
                    {
                        id: Date.now() + 3,
                        item: 'Grilled Chicken Salad',
                        calories: 450,
                        protein: 35,
                        carbs: 15,
                        fat: 25,
                    },
                    {
                        id: Date.now() + 4,
                        item: 'Quinoa Bowl with Vegetables',
                        calories: 380,
                        protein: 18,
                        carbs: 45,
                        fat: 15,
                    }
                ],
                dinner: [
                    {
                        id: Date.now() + 5,
                        item: 'Salmon with Roasted Vegetables',
                        calories: 550,
                        protein: 40,
                        carbs: 20,
                        fat: 30,
                    },
                    {
                        id: Date.now() + 6,
                        item: 'Lean Beef Stir-Fry',
                        calories: 480,
                        protein: 35,
                        carbs: 25,
                        fat: 22,
                    }
                ],
                snacks: [
                    {
                        id: Date.now() + 7,
                        item: 'Greek Yogurt with Nuts',
                        calories: 200,
                        protein: 15,
                        carbs: 10,
                        fat: 12,
                    },
                    {
                        id: Date.now() + 8,
                        item: 'Apple with Almond Butter',
                        calories: 180,
                        protein: 8,
                        carbs: 25,
                        fat: 10,
                    }
                ]
            };
            
            updateMealPlan(mockMealPlan);
            Alert.alert('AI Unavailable', 'Using sample meal plan. AI service is currently unavailable.');
        }
    };

    const addMealToDaily = (meal) => {
        Alert.alert(
            'Add to Daily Intake',
            `Add ${meal.item} (${meal.calories} calories) to your daily intake?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Add', 
                    onPress: () => {
                        addFood({
                            id: Date.now(),
                            name: meal.item,
                            calories: meal.calories,
                            protein: meal.protein || 0,
                            carbs: meal.carbs || 0,
                            fat: meal.fat || 0,
                            timestamp: new Date().toISOString(),
                        });
                        Alert.alert('Added!', `${meal.item} has been added to your daily intake.`);
                    }
                },
            ]
        );
    };

    const renderMealItem = ({ item }) => (
        <TouchableOpacity
            style={styles.mealItem}
            onPress={() => addMealToDaily(item)}
        >
            <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{item.item}</Text>
                <View style={styles.macroInfo}>
                    <Text style={styles.macroText}>P: {item.protein}g</Text>
                    <Text style={styles.macroText}>C: {item.carbs}g</Text>
                    <Text style={styles.macroText}>F: {item.fat}g</Text>
                </View>
            </View>
            <View style={styles.mealCalories}>
                <Text style={styles.calorieText}>{item.calories}</Text>
                <Text style={styles.calorieLabel}>cal</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#4A90E2" />
        </TouchableOpacity>
    );

    const renderMealCategory = ({ item: category }) => {
        const meals = mealPlan[category.key] || [];
        
        return (
            <View style={styles.categoryContainer}>
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleContainer}>
                        <Ionicons name={category.icon} size={20} color="#4A90E2" />
                        <Text style={styles.categoryTitle}>{category.title}</Text>
                    </View>
                    <Text style={styles.mealCount}>{meals.length} items</Text>
                </View>
                
                {meals.length > 0 ? (
                    <FlatList
                        data={meals}
                        renderItem={renderMealItem}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyCategory}>
                        <Ionicons name="restaurant-outline" size={32} color="#CCC" />
                        <Text style={styles.emptyText}>No meals planned</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Your Meal Plan</Text>
                    <Text style={styles.subtitle}>
                        Personalized nutrition recommendations for today
                    </Text>
                </View>

                <View style={styles.summaryCard}>
                    <LinearGradient
                        colors={['#4A90E2', '#357ABD']}
                        style={styles.summaryGradient}
                    >
                        <Text style={styles.summaryTitle}>Today's Plan</Text>
                        <View style={styles.summaryStats}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNumber}>
                                    {Object.values(mealPlan).flat().length}
                                </Text>
                                <Text style={styles.summaryLabel}>Total Meals</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNumber}>
                                    {Object.values(mealPlan).flat().reduce((sum, meal) => sum + meal.calories, 0)}
                                </Text>
                                <Text style={styles.summaryLabel}>Total Calories</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNumber}>
                                    {Object.values(mealPlan).flat().reduce((sum, meal) => sum + (meal.protein || 0), 0)}g
                                </Text>
                                <Text style={styles.summaryLabel}>Protein</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateNewMealPlan}
                >
                    <LinearGradient
                        colors={['#4CAF50', '#45A049']}
                        style={styles.generateGradient}
                    >
                        <Ionicons name="restaurant" size={20} color="white" />
                        <Text style={styles.generateText}>Generate AI Meal Plan</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <FlatList
                    data={mealCategories}
                    renderItem={renderMealCategory}
                    keyExtractor={(item) => item.key}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    summaryCard: {
        margin: 16,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryGradient: {
        padding: 20,
        borderRadius: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 16,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    summaryLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 8,
    },
    generateButton: {
        margin: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    generateGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    generateText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    categoryContainer: {
        backgroundColor: 'white',
        margin: 16,
        marginTop: 8,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    mealCount: {
        fontSize: 14,
        color: '#666',
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 8,
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    macroInfo: {
        flexDirection: 'row',
        gap: 12,
    },
    macroText: {
        fontSize: 12,
        color: '#666',
    },
    mealCalories: {
        alignItems: 'center',
        marginRight: 12,
    },
    calorieText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    calorieLabel: {
        fontSize: 10,
        color: '#666',
    },
    emptyCategory: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 14,
        color: '#CCC',
        marginTop: 8,
    },
});

export default MealPlanScreen;
