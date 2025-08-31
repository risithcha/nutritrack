import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { state, resetDailyNutrition } = useNutrition();
  const { userProfile, dailyNutrition } = state;
  const { logOut, user } = useAuth();

  const calculateBMR = () => {
    // Using the Mifflin-St Jeor formula (works with pounds and inches)
    const { gender, weight, height, age } = userProfile;
    if (gender === 'male') {
      return 4.536 * weight + 15.875 * height - 5 * age + 5;
    } else {
      return 4.536 * weight + 15.875 * height - 5 * age - 161;
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };
    return Math.round(bmr * activityMultipliers[userProfile.activityLevel]);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            logOut();
          }
        },
      ]
    );
  };

  const handleResetDaily = () => {
    Alert.alert(
      'Reset Daily Progress',
      'Are you sure you want to reset today\'s nutrition tracking? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetDailyNutrition();
            Alert.alert('Reset Complete', 'Daily nutrition tracking has been reset.');
          }
        },
      ]
    );
  };

  const ProfileHeader = () => (
    <View style={styles.profileHeader}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.profileGradient}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="white" />
          </View>
        </View>
        <Text style={styles.profileName}>{user?.email || 'NutriTrack User'}</Text>
        <Text style={styles.profileSubtitle}>Health & Wellness</Text>
      </LinearGradient>
    </View>
  );

  const ProfileStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{dailyNutrition.target}</Text>
        <Text style={styles.statLabel}>Daily Calories</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{userProfile.weight}lbs</Text>
        <Text style={styles.statLabel}>Weight</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{userProfile.height}"</Text>
        <Text style={styles.statLabel}>Height</Text>
      </View>
    </View>
  );

  const ProfileInfo = () => (
    <View style={styles.infoContainer}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.infoItem}>
        <View style={styles.infoLabelContainer}>
          <Ionicons name="person" size={20} color="#4A90E2" />
          <Text style={styles.infoLabel}>Gender</Text>
        </View>
        <Text style={styles.infoValue}>{userProfile.gender}</Text>
      </View>
      
      <View style={styles.infoItem}>
        <View style={styles.infoLabelContainer}>
                        <Ionicons name="fitness" size={20} color="#4A90E2" />
          <Text style={styles.infoLabel}>Weight</Text>
        </View>
        <Text style={styles.infoValue}>{userProfile.weight} lbs</Text>
      </View>
      
      <View style={styles.infoItem}>
        <View style={styles.infoLabelContainer}>
                     <Ionicons name="resize-outline" size={20} color="#4A90E2" />
          <Text style={styles.infoLabel}>Height</Text>
        </View>
        <Text style={styles.infoValue}>{userProfile.height} inches</Text>
      </View>
      
      <View style={styles.infoItem}>
        <View style={styles.infoLabelContainer}>
          <Ionicons name="calendar" size={20} color="#4A90E2" />
          <Text style={styles.infoLabel}>Age</Text>
        </View>
        <Text style={styles.infoValue}>{userProfile.age} years</Text>
      </View>
      
      <View style={styles.infoItem}>
        <View style={styles.infoLabelContainer}>
          <Ionicons name="fitness" size={20} color="#4A90E2" />
          <Text style={styles.infoLabel}>Activity Level</Text>
        </View>
        <Text style={styles.infoValue}>{userProfile.activityLevel}</Text>
      </View>
    </View>
  );

  const ActionButtons = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.buttonGradient}
        >
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('Scan', { screen: 'FoodHistory' })}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF5252']}
          style={styles.buttonGradient}
        >
          <Ionicons name="time" size={20} color="white" />
          <Text style={styles.buttonText}>View Food History</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleResetDaily}
      >
        <View style={styles.secondaryButtonContent}>
          <Ionicons name="refresh" size={20} color="#666" />
          <Text style={styles.secondaryButtonText}>Reset Daily Progress</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <View style={styles.signOutButtonContent}>
          <Ionicons name="log-out" size={20} color="#E74C3C" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const NutritionSummary = () => (
    <View style={styles.nutritionContainer}>
      <Text style={styles.sectionTitle}>Today's Summary</Text>
      
      <View style={styles.nutritionCard}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Calories</Text>
          <Text style={styles.nutritionValue}>
            {dailyNutrition.consumed} / {dailyNutrition.target}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Protein</Text>
          <Text style={styles.nutritionValue}>{dailyNutrition.protein}g</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Carbs</Text>
          <Text style={styles.nutritionValue}>{dailyNutrition.carbs}g</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Fat</Text>
          <Text style={styles.nutritionValue}>{dailyNutrition.fat}g</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProfileHeader />
      <ProfileStats />
      <ProfileInfo />
      <ActionButtons />
      <NutritionSummary />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  profileHeader: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  actionContainer: {
    margin: 16,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  signOutButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nutritionContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nutritionCard: {
    gap: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#333',
  },
  nutritionValue: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default ProfileScreen;
