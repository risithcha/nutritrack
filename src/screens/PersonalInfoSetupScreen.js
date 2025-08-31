import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PersonalInfoSetupScreen = ({ navigation, route }) => {
  const { userEmail, userId } = route.params || {};
  const { updateUserProfile } = useNutrition();
  const { user: authUser, updateUserProfile: updateFirebaseProfile, refreshUserProfileStatus } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Make sure they filled out everything we need
    if (!formData.name || !formData.age || !formData.weight || !formData.height) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (isNaN(formData.age) || isNaN(formData.weight) || isNaN(formData.height)) {
      Alert.alert('Invalid Data', 'Please enter valid numbers for age, weight, and height.');
      return;
    }

    setIsLoading(true);
    try {
      // Save the profile info in the app
      await updateUserProfile({
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
      });

      // Also save it to Firebase if they're logged in
      if (authUser?.uid) {
        await updateFirebaseProfile(authUser.uid, {
          ...formData,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
        });
      }

      // Check if their profile is complete now
      await refreshUserProfileStatus();

      Alert.alert(
        'Profile Created!',
        'Your profile has been set up successfully. You can now start tracking your nutrition!',
        [
          {
            text: 'Get Started',
            onPress: () => {
              // The auth state listener will automatically navigate to main app
              // since profileComplete is now true
              console.log('Profile setup complete, auth state will handle navigation');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.header}
        >
          <Ionicons name="person-circle" size={80} color="white" />
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us personalize your experience</Text>
          {userEmail && (
            <Text style={styles.email}>{userEmail}</Text>
          )}
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={formData.age}
              onChangeText={(value) => updateFormData('age', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.pickerContainer}>
            <Ionicons name="male-female" size={20} color="#666" style={styles.inputIcon} />
            <Picker
              selectedValue={formData.gender}
              style={styles.picker}
              onValueChange={(value) => updateFormData('gender', value)}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="fitness" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Weight (lbs)"
              value={formData.weight}
              onChangeText={(value) => updateFormData('weight', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="resize-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Height (inches)"
              value={formData.height}
              onChangeText={(value) => updateFormData('height', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.pickerContainer}>
            <Ionicons name="fitness" size={20} color="#666" style={styles.inputIcon} />
            <Picker
              selectedValue={formData.activityLevel}
              style={styles.picker}
              onValueChange={(value) => updateFormData('activityLevel', value)}
            >
              <Picker.Item label="Sedentary (little or no exercise)" value="sedentary" />
              <Picker.Item label="Light (light exercise 1-3 days/week)" value="light" />
              <Picker.Item label="Moderate (moderate exercise 3-5 days/week)" value="moderate" />
              <Picker.Item label="Active (hard exercise 6-7 days/week)" value="active" />
              <Picker.Item label="Very Active (very hard exercise, physical job)" value="veryActive" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Ionicons name="flag" size={20} color="#666" style={styles.inputIcon} />
            <Picker
              selectedValue={formData.goal}
              style={styles.picker}
              onValueChange={(value) => updateFormData('goal', value)}
            >
              <Picker.Item label="Maintain Weight" value="maintain" />
              <Picker.Item label="Lose Weight" value="lose" />
              <Picker.Item label="Gain Weight" value="gain" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.saveGradient}
            >
              <Text style={styles.saveText}>
                {isLoading ? 'Setting Up Profile...' : 'Complete Setup'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  email: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 10,
  },
  form: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  saveButton: {
    marginTop: 30,
    borderRadius: 10,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PersonalInfoSetupScreen;
