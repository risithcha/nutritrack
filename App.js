import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import PersonalInfoSetupScreen from './src/screens/PersonalInfoSetupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FoodScanningScreen from './src/screens/FoodScanningScreen';
import FoodAnalysisScreen from './src/screens/FoodAnalysisScreen';
import FoodHistoryScreen from './src/screens/FoodHistoryScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import WeightTrackingScreen from './src/screens/WeightTrackingScreen';
import WaterTrackingScreen from './src/screens/WaterTrackingScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NutritionProvider } from './src/context/NutritionContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication Stack
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="PersonalInfoSetup" component={PersonalInfoSetupScreen} />
    </Stack.Navigator>
);

// Main App Stack
const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="WeightTracking" component={WeightTrackingScreen} />
        <Stack.Screen name="WaterTracking" component={WaterTrackingScreen} />
    </Stack.Navigator>
);

function ProfileStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="ProfileMain" 
                component={ProfileScreen} 
                options={{ 
                    title: 'Profile',
                    headerStyle: {
                        backgroundColor: '#4A90E2',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
        </Stack.Navigator>
    );
}

function FoodScanningStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="FoodScanningMain" 
                component={FoodScanningScreen} 
                options={{ 
                    title: 'Scan Food',
                    headerStyle: {
                        backgroundColor: '#4A90E2',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
            <Stack.Screen 
                name="FoodAnalysis" 
                component={FoodAnalysisScreen}
                options={{ 
                    title: 'Food Analysis',
                    headerStyle: {
                        backgroundColor: '#4A90E2',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen 
                name="FoodHistory" 
                component={FoodHistoryScreen}
                options={{ 
                    title: 'Food History',
                    headerStyle: {
                        backgroundColor: '#4A90E2',
                    },
                    headerTintColor: '#fff',
                }}
            />
        </Stack.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Scan') {
                        iconName = focused ? 'camera' : 'camera-outline';
                    } else if (route.name === 'Meals') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4A90E2',
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                    backgroundColor: '#4A90E2',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={DashboardScreen}
                options={{ title: 'Dashboard' }}
            />
            <Tab.Screen 
                name="Scan" 
                component={FoodScanningStack}
                options={{ headerShown: false }}
            />
            <Tab.Screen 
                name="Meals" 
                component={MealPlanScreen}
                options={{ title: 'Meal Plan' }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileStack}
                options={{ headerShown: false }}
            />
        </Tab.Navigator>
    );
}

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Scan') {
                        iconName = focused ? 'camera' : 'camera-outline';
                    } else if (route.name === 'Meals') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4A90E2',
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                    backgroundColor: '#4A90E2',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={DashboardScreen}
                options={{ title: 'Dashboard' }}
            />
            <Tab.Screen 
                name="Scan" 
                component={FoodScanningStack}
                options={{ headerShown: false }}
            />
            <Tab.Screen 
                name="Meals" 
                component={MealPlanScreen}
                options={{ title: 'Meal Plan' }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileStack}
                options={{ headerShown: false }}
            />
        </Tab.Navigator>
    );
}

// Main App Component
function AppContent() {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Show nothing while we check if user is logged in
    }

    return (
        <NavigationContainer>
            {user ? (
                user.profileComplete ? <MainStack /> : <AuthStack />
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NutritionProvider>
                <AppContent />
            </NutritionProvider>
        </AuthProvider>
    );
}
