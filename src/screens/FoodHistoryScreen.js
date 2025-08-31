import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

const FoodHistoryScreen = ({ navigation }) => {
  const [foodHistory, setFoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadFoodHistory = async () => {
    if (!user?.uid) {
      console.log('No user UID available for loading food history');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading food history for user:', user.uid);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data from Firestore:', userData);
        
        const history = userData.foodHistory || [];
        console.log('Food history array:', history);
        
        // Put newest items first
        const sortedHistory = history.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        console.log('Sorted food history:', sortedHistory);
        
        setFoodHistory(sortedHistory);
      } else {
        console.log('User document does not exist in Firestore');
      }
    } catch (error) {
      console.error('Error loading food history:', error);
      Alert.alert('Error', 'Failed to load food history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoodHistory();
    setRefreshing(false);
  };

  const deleteFoodItem = async (foodId) => {
    Alert.alert(
      'Delete Food Item',
      'Are you sure you want to delete this food item from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedHistory = foodHistory.filter(item => item.id !== foodId);
              await updateDoc(doc(db, 'users', user.uid), {
                foodHistory: updatedHistory
              });
              setFoodHistory(updatedHistory);
              Alert.alert('Success', 'Food item deleted from history');
            } catch (error) {
              console.error('Error deleting food item:', error);
              Alert.alert('Error', 'Failed to delete food item');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    loadFoodHistory();
  }, [user?.uid]);

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => navigation.navigate('FoodAnalysis', { foodData: item })}
    >
      <View style={styles.foodImageContainer}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.foodImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant" size={30} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.foodCalories}>{item.calories} calories</Text>
        <Text style={styles.foodTime}>
          {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
        </Text>
      </View>
      
      <View style={styles.foodMacros}>
        <Text style={styles.macroText}>P: {item.protein}g</Text>
        <Text style={styles.macroText}>C: {item.carbs}g</Text>
        <Text style={styles.macroText}>F: {item.fat}g</Text>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFoodItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Food History</Text>
      <Text style={styles.emptySubtitle}>
        Start scanning food to build your history
      </Text>
             <TouchableOpacity
         style={styles.scanButton}
         onPress={() => navigation.navigate('Scan', { screen: 'FoodScanningMain' })}
       >
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.scanButtonGradient}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan Food</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading food history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Food History</Text>
        <Text style={styles.headerSubtitle}>
          {foodHistory.length} items scanned
        </Text>
      </LinearGradient>

      {foodHistory.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={foodHistory}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A90E2']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  foodItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodImageContainer: {
    marginRight: 16,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginBottom: 2,
  },
  foodTime: {
    fontSize: 12,
    color: '#666',
  },
  foodMacros: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  macroText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  scanButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default FoodHistoryScreen;
