# NutriTrack

A nutrition tracking mobile app built with React Native and Expo, featuring AI-powered food analysis and personalized health monitoring.

## Features

- **AI Food Analysis**: Take photos of food and get instant nutritional information
- **Nutrition Tracking**: Monitor daily calorie intake and macronutrients
- **Weight & Water Tracking**: Track progress with visual indicators
- **User Authentication**: Secure login with Firebase
- **Personalized Profiles**: Individual user data and goals

## Technology Stack

- React Native with Expo
- Firebase (Authentication & Firestore)
- Google Gemini AI API
- React Navigation

## Prerequisites

- Node.js (version 14 or higher)
- Expo CLI
- Firebase project with Authentication and Firestore
- Google AI API key

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file with your API keys:
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 3. Firebase Setup
1. Create a Firebase project
2. Enable Authentication with Email/Password
3. Create a Firestore database

### 4. Google AI Setup
1. Get a Google AI API key from Google AI Studio
2. Add to your `.env` file

## Running the App

```bash
# Start application
npx expo start
```

---

**Made for the HackAMind Hackathon**