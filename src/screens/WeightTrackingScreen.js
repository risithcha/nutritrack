import React, { useState, useEffect } from 'react';
import {
        View,
        Text,
        StyleSheet,
        ScrollView,
        TouchableOpacity,
        TextInput,
        Alert,
        Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNutrition } from '../context/NutritionContext';

const { width } = Dimensions.get('window');

const WeightTrackingScreen = ({ navigation }) => {
        const { weightData, addWeightEntry, weightGoal } = useNutrition();
        const [newWeight, setNewWeight] = useState('');
        const [showAddForm, setShowAddForm] = useState(false);

        // Handle adding a new weight entry
        const handleAddWeight = () => {
                if (!newWeight || isNaN(newWeight) || parseFloat(newWeight) <= 0) {
                        Alert.alert('Invalid Weight', 'Please enter a valid weight.');
                        return;
                }

                const weight = parseFloat(newWeight);
                addWeightEntry(weight);
                setNewWeight('');
                setShowAddForm(false);
        };

        // Calculate weight change from first entry
        const getWeightChange = () => {
                if (weightData.length < 2) return null;
                const firstWeight = weightData[0].weight;
                const latestWeight = weightData[weightData.length - 1].weight;
                return latestWeight - firstWeight;
        };

        // Calculate weekly average
        const getWeeklyAverage = () => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                
                const recentEntries = weightData.filter(entry => 
                        new Date(entry.date) >= oneWeekAgo
                );
                
                if (recentEntries.length === 0) return null;
                
                const total = recentEntries.reduce((sum, entry) => sum + entry.weight, 0);
                return total / recentEntries.length;
        };

        // Format date for display
        const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                });
        };

        const weightChange = getWeightChange();
        const weeklyAverage = getWeeklyAverage();
        const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null;

        return (
                <ScrollView style={styles.container}>
                        <LinearGradient
                                colors={['#4A90E2', '#357ABD']}
                                style={styles.header}
                        >
                                <View style={styles.headerContent}>
                                        <TouchableOpacity
                                                style={styles.backButton}
                                                onPress={() => navigation.goBack()}
                                        >
                                                <Ionicons name="arrow-back" size={24} color="white" />
                                        </TouchableOpacity>
                                        <View style={styles.headerTextContainer}>
                                                <Text style={styles.headerTitle}>Weight Tracking</Text>
                                                <Text style={styles.headerSubtitle}>Monitor your progress</Text>
                                        </View>
                                </View>
                        </LinearGradient>

                        {/* Current Weight Card */}
                        <View style={styles.card}>
                                <Text style={styles.cardTitle}>Current Weight</Text>
                                {latestWeight ? (
                                        <View style={styles.weightDisplay}>
                                                <Text style={styles.weightValue}>{latestWeight}</Text>
                                                <Text style={styles.weightUnit}>lbs</Text>
                                        </View>
                                ) : (
                                        <Text style={styles.noDataText}>No weight data yet</Text>
                                )}
                                
                                                                    {weightGoal && (
                                            <View style={styles.goalInfo}>
                                                    <Text style={styles.goalText}>Goal: {weightGoal} lbs</Text>
                                                    {latestWeight && (
                                                            <Text style={styles.goalProgress}>
                                                                    {Math.abs(latestWeight - weightGoal).toFixed(1)} lbs {latestWeight > weightGoal ? 'to go' : 'ahead'}
                                                            </Text>
                                                    )}
                                            </View>
                                    )}
                        </View>

                        {/* Stats Cards */}
                        <View style={styles.statsContainer}>
                                {weightChange !== null && (
                                        <View style={styles.statCard}>
                                                <Text style={styles.statLabel}>Total Change</Text>
                                                <Text style={[
                                                        styles.statValue,
                                                        { color: weightChange > 0 ? '#E74C3C' : weightChange < 0 ? '#27AE60' : '#7F8C8D' }
                                                                                                    ]}>
                                                            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
                                                    </Text>
                                        </View>
                                )}

                                {weeklyAverage && (
                                                                                    <View style={styles.statCard}>
                                                    <Text style={styles.statLabel}>Weekly Avg</Text>
                                                    <Text style={styles.statValue}>{weeklyAverage.toFixed(1)} lbs</Text>
                                            </View>
                                )}
                        </View>

                        {/* Add Weight Button */}
                        <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowAddForm(true)}
                        >
                                <Ionicons name="add" size={24} color="white" />
                                <Text style={styles.addButtonText}>Add Weight Entry</Text>
                        </TouchableOpacity>

                        {/* Add Weight Form */}
                        {showAddForm && (
                                <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Add New Weight Entry</Text>
                                                                                    <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter weight (lbs)"
                                                    value={newWeight}
                                                    onChangeText={setNewWeight}
                                                    keyboardType="numeric"
                                                    autoFocus
                                            />
                                        <View style={styles.formButtons}>
                                                <TouchableOpacity
                                                        style={[styles.formButton, styles.cancelButton]}
                                                        onPress={() => {
                                                                setShowAddForm(false);
                                                                setNewWeight('');
                                                        }}
                                                >
                                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                        style={[styles.formButton, styles.saveButton]}
                                                        onPress={handleAddWeight}
                                                >
                                                        <Text style={styles.saveButtonText}>Save</Text>
                                                </TouchableOpacity>
                                        </View>
                                </View>
                        )}

                        {/* Weight History */}
                        <View style={styles.card}>
                                <Text style={styles.cardTitle}>Weight History</Text>
                                {weightData.length > 0 ? (
                                        weightData.slice().reverse().map((entry, index) => (
                                                <View key={index} style={styles.historyItem}>
                                                                                                                    <View style={styles.historyInfo}>
                                                                    <Text style={styles.historyWeight}>{entry.weight} lbs</Text>
                                                                    <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                                                            </View>
                                                        {index < weightData.length - 1 && (
                                                                <View style={styles.historyChange}>
                                                                        <Text style={[
                                                                                styles.changeText,
                                                                                { color: entry.weight > weightData[weightData.length - 2 - index].weight ? '#E74C3C' : '#27AE60' }
                                                                        ]}>
                                                                                {entry.weight > weightData[weightData.length - 2 - index].weight ? '↗' : '↘'}
                                                                        </Text>
                                                                </View>
                                                        )}
                                                </View>
                                        ))
                                ) : (
                                        <Text style={styles.noDataText}>No weight history yet</Text>
                                )}
                        </View>
                </ScrollView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#F5F5F5',
        },
        header: {
                padding: 20,
                paddingTop: 60,
                paddingBottom: 30,
        },
        headerContent: {
                flexDirection: 'row',
                alignItems: 'center',
        },
        backButton: {
                padding: 10,
                marginRight: 15,
        },
        headerTextContainer: {
                flex: 1,
        },
        headerTitle: {
                fontSize: 28,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
        },
        headerSubtitle: {
                fontSize: 16,
                color: 'white',
                textAlign: 'center',
                marginTop: 5,
                opacity: 0.9,
        },
        card: {
                backgroundColor: 'white',
                margin: 15,
                padding: 20,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
        },
        cardTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 15,
                color: '#333',
        },
        weightDisplay: {
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'center',
                marginBottom: 15,
        },
        weightValue: {
                fontSize: 48,
                fontWeight: 'bold',
                color: '#4A90E2',
        },
        weightUnit: {
                fontSize: 20,
                color: '#666',
                marginLeft: 5,
        },
        goalInfo: {
                alignItems: 'center',
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: '#E0E0E0',
        },
        goalText: {
                fontSize: 16,
                color: '#666',
                marginBottom: 5,
        },
        goalProgress: {
                fontSize: 14,
                color: '#4A90E2',
                fontWeight: '500',
        },
        statsContainer: {
                flexDirection: 'row',
                marginHorizontal: 15,
                marginBottom: 15,
        },
        statCard: {
                flex: 1,
                backgroundColor: 'white',
                padding: 15,
                borderRadius: 12,
                marginHorizontal: 5,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
        },
        statLabel: {
                fontSize: 14,
                color: '#666',
                marginBottom: 5,
        },
        statValue: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#333',
        },
        addButton: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#4A90E2',
                margin: 15,
                padding: 15,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
        },
        addButtonText: {
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
        },
        formCard: {
                backgroundColor: 'white',
                margin: 15,
                padding: 20,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
        },
        formTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 15,
                color: '#333',
        },
        input: {
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 15,
        },
        formButtons: {
                flexDirection: 'row',
                justifyContent: 'space-between',
        },
        formButton: {
                flex: 1,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginHorizontal: 5,
        },
        cancelButton: {
                backgroundColor: '#F5F5F5',
        },
        saveButton: {
                backgroundColor: '#4A90E2',
        },
        cancelButtonText: {
                color: '#666',
                fontSize: 16,
                fontWeight: '600',
        },
        saveButtonText: {
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
        },
        historyItem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#F0F0F0',
        },
        historyInfo: {
                flex: 1,
        },
        historyWeight: {
                fontSize: 16,
                fontWeight: '600',
                color: '#333',
        },
        historyDate: {
                fontSize: 14,
                color: '#666',
                marginTop: 2,
        },
        historyChange: {
                marginLeft: 10,
        },
        changeText: {
                fontSize: 18,
                fontWeight: 'bold',
        },
        noDataText: {
                textAlign: 'center',
                color: '#999',
                fontStyle: 'italic',
                marginVertical: 20,
        },
});

export default WeightTrackingScreen;
