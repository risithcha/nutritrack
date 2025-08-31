import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNutrition } from '../context/NutritionContext';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { state } = useNutrition();
  const { dailyNutrition } = state;

  const CalorieCard = () => (
    <View style={styles.calorieCard}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.calorieGradient}
      >
        <Text style={styles.calorieTitle}>Today's Calories</Text>
        <View style={styles.calorieStats}>
          <View style={styles.calorieItem}>
            <Text style={styles.calorieNumber}>{dailyNutrition.consumed}</Text>
            <Text style={styles.calorieLabel}>Consumed</Text>
          </View>
          <View style={styles.calorieDivider} />
          <View style={styles.calorieItem}>
            <Text style={styles.calorieNumber}>{dailyNutrition.target}</Text>
            <Text style={styles.calorieLabel}>Target</Text>
          </View>
          <View style={styles.calorieDivider} />
          <View style={styles.calorieItem}>
            <Text style={[
              styles.calorieNumber,
              { color: dailyNutrition.remaining < 0 ? '#FF6B6B' : '#4CAF50' }
            ]}>
              {dailyNutrition.remaining}
            </Text>
            <Text style={styles.calorieLabel}>Remaining</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min((dailyNutrition.consumed / dailyNutrition.target) * 100, 100)}%`,
                backgroundColor: dailyNutrition.consumed > dailyNutrition.target ? '#FF6B6B' : '#4CAF50'
              }
            ]} 
          />
        </View>
      </LinearGradient>
    </View>
  );

  const MacroCard = () => (
    <View style={styles.macroCard}>
      <Text style={styles.sectionTitle}>Macronutrients</Text>
      <View style={styles.macroGrid}>
        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: '#FF6B6B' }]}>
            <Ionicons name="fitness" size={24} color="white" />
          </View>
          <Text style={styles.macroValue}>{dailyNutrition.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: '#4ECDC4' }]}>
            <Ionicons name="leaf" size={24} color="white" />
          </View>
          <Text style={styles.macroValue}>{dailyNutrition.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: '#45B7D1' }]}>
            <Ionicons name="water" size={24} color="white" />
          </View>
          <Text style={styles.macroValue}>{dailyNutrition.fat}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );

  const ActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Scan', { screen: 'FoodScanningMain' })}
      >
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.buttonGradient}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Scan Food</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Meals')}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.buttonGradient}
        >
          <Ionicons name="restaurant" size={24} color="white" />
          <Text style={styles.buttonText}>Generate Meal Plan</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tertiaryButton}
        onPress={() => navigation.navigate('Scan', { screen: 'FoodHistory' })}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF5252']}
          style={styles.buttonGradient}
        >
          <Ionicons name="time" size={24} color="white" />
          <Text style={styles.buttonText}>View History</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const QuickStats = () => (
    <View style={styles.quickStats}>
      <Text style={styles.sectionTitle}>Quick Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{state.scannedFoods.length}</Text>
          <Text style={styles.statLabel}>Foods Logged</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round((dailyNutrition.consumed / dailyNutrition.target) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Daily Goal</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {dailyNutrition.remaining > 0 ? 'On Track' : 'Over Limit'}
          </Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CalorieCard />
      <MacroCard />
      <ActionButtons />
      <QuickStats />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  calorieCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calorieGradient: {
    padding: 20,
    borderRadius: 16,
  },
  calorieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calorieItem: {
    alignItems: 'center',
    flex: 1,
  },
  calorieNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  calorieLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  calorieDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroCard: {
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
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
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
  secondaryButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tertiaryButton: {
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
  quickStats: {
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default DashboardScreen;
