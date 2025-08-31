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

const WaterTrackingScreen = ({ navigation }) => {
        const { waterData, addWaterEntry, waterGoal, updateWaterGoal } = useNutrition();
        const [showAddForm, setShowAddForm] = useState(false);
        const [showGoalForm, setShowGoalForm] = useState(false);
        const [newAmount, setNewAmount] = useState('');
        const [newGoal, setNewGoal] = useState('');

        // Get today's water consumption
        const getTodayWater = () => {
                const today = new Date().toDateString();
                return waterData
                        .filter(entry => new Date(entry.date).toDateString() === today)
                        .reduce((total, entry) => total + entry.amount, 0);
        };

        // Handle adding a new water entry
        const handleAddWater = () => {
                if (!newAmount || isNaN(newAmount) || parseFloat(newAmount) <= 0) {
                        Alert.alert('Invalid Amount', 'Please enter a valid amount.');
                        return;
                }

                const amount = parseFloat(newAmount);
                addWaterEntry(amount);
                setNewAmount('');
                setShowAddForm(false);
        };

        // Handle updating water goal
        const handleUpdateGoal = () => {
                if (!newGoal || isNaN(newGoal) || parseFloat(newGoal) <= 0) {
                        Alert.alert('Invalid Goal', 'Please enter a valid goal amount.');
                        return;
                }

                const goal = parseFloat(newGoal);
                updateWaterGoal(goal);
                setNewGoal('');
                setShowGoalForm(false);
        };

        // Calculate progress percentage
        const getProgressPercentage = () => {
                if (!waterGoal) return 0;
                const todayWater = getTodayWater();
                return Math.min((todayWater / waterGoal) * 100, 100);
        };

        // Get weekly average
        const getWeeklyAverage = () => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                
                const recentEntries = waterData.filter(entry => 
                        new Date(entry.date) >= oneWeekAgo
                );
                
                if (recentEntries.length === 0) return 0;
                
                const total = recentEntries.reduce((sum, entry) => sum + entry.amount, 0);
                return total / 7; // Average per day over the week
        };

        // Format time for display
        const formatTime = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleTimeString('en-US', { 
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                });
        };

        const todayWater = getTodayWater();
        const progressPercentage = getProgressPercentage();
        const weeklyAverage = getWeeklyAverage();
        const remaining = waterGoal ? Math.max(0, waterGoal - todayWater) : 0;

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
                                                <Text style={styles.headerTitle}>Water Tracking</Text>
                                                <Text style={styles.headerSubtitle}>Stay hydrated, stay healthy</Text>
                                        </View>
                                </View>
                        </LinearGradient>

                        {/* Today's Progress Card */}
                        <View style={styles.card}>
                                <View style={styles.progressHeader}>
                                        <Text style={styles.cardTitle}>Today's Progress</Text>
                                        <TouchableOpacity
                                                style={styles.editGoalButton}
                                                onPress={() => setShowGoalForm(true)}
                                        >
                                                <Ionicons name="settings-outline" size={20} color="#4A90E2" />
                                        </TouchableOpacity>
                                </View>

                                {/* Progress Circle */}
                                <View style={styles.progressContainer}>
                                        <View style={styles.progressCircle}>
                                                <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
                                        </View>
                                                                                    <View style={styles.progressInfo}>
                                                    <Text style={styles.currentAmount}>{todayWater.toFixed(0)}</Text>
                                                    <Text style={styles.unit}>oz</Text>
                                                    {waterGoal && (
                                                            <Text style={styles.goalText}>of {waterGoal}oz goal</Text>
                                                    )}
                                            </View>
                                </View>

                                {/* Progress Bar */}
                                <View style={styles.progressBarContainer}>
                                        <View style={styles.progressBar}>
                                                <View 
                                                        style={[
                                                                styles.progressFill, 
                                                                { width: `${progressPercentage}%` }
                                                        ]} 
                                                />
                                        </View>
                                </View>

                                                                    {remaining > 0 && (
                                            <Text style={styles.remainingText}>
                                                    {remaining.toFixed(0)}oz remaining today
                                            </Text>
                                    )}
                        </View>

                        {/* Quick Add Buttons */}
                        <View style={styles.quickAddContainer}>
                                <Text style={styles.quickAddTitle}>Quick Add</Text>
                                                                    <View style={styles.quickAddButtons}>
                                            {[8, 16, 32].map((amount) => (
                                                    <TouchableOpacity
                                                            key={amount}
                                                            style={styles.quickAddButton}
                                                            onPress={() => addWaterEntry(amount)}
                                                    >
                                                            <Text style={styles.quickAddAmount}>+{amount}oz</Text>
                                                    </TouchableOpacity>
                                            ))}
                                    </View>
                        </View>

                        {/* Stats Cards */}
                        <View style={styles.statsContainer}>
                                                                    <View style={styles.statCard}>
                                            <Text style={styles.statLabel}>Weekly Avg</Text>
                                            <Text style={styles.statValue}>{weeklyAverage.toFixed(0)}oz</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                            <Text style={styles.statLabel}>Today's Goal</Text>
                                            <Text style={styles.statValue}>{waterGoal || 0}oz</Text>
                                    </View>
                        </View>

                        {/* Add Custom Amount Button */}
                        <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowAddForm(true)}
                        >
                                <Ionicons name="add" size={24} color="white" />
                                <Text style={styles.addButtonText}>Add Custom Amount</Text>
                        </TouchableOpacity>

                        {/* Add Water Form */}
                        {showAddForm && (
                                <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Add Water Intake</Text>
                                                                                    <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter amount (ounces)"
                                                    value={newAmount}
                                                    onChangeText={setNewAmount}
                                                    keyboardType="numeric"
                                                    autoFocus
                                            />
                                        <View style={styles.formButtons}>
                                                <TouchableOpacity
                                                        style={[styles.formButton, styles.cancelButton]}
                                                        onPress={() => {
                                                                setShowAddForm(false);
                                                                setNewAmount('');
                                                        }}
                                                >
                                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                        style={[styles.formButton, styles.saveButton]}
                                                        onPress={handleAddWater}
                                                >
                                                        <Text style={styles.saveButtonText}>Add</Text>
                                                </TouchableOpacity>
                                        </View>
                                </View>
                        )}

                        {/* Update Goal Form */}
                        {showGoalForm && (
                                <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Update Daily Goal</Text>
                                                                                    <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter daily goal (ounces)"
                                                    value={newGoal}
                                                    onChangeText={setNewGoal}
                                                    keyboardType="numeric"
                                                    autoFocus
                                            />
                                        <View style={styles.formButtons}>
                                                <TouchableOpacity
                                                        style={[styles.formButton, styles.cancelButton]}
                                                        onPress={() => {
                                                                setShowGoalForm(false);
                                                                setNewGoal('');
                                                        }}
                                                >
                                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                        style={[styles.formButton, styles.saveButton]}
                                                        onPress={handleUpdateGoal}
                                                >
                                                        <Text style={styles.saveButtonText}>Update</Text>
                                                </TouchableOpacity>
                                        </View>
                                </View>
                        )}

                        {/* Today's History */}
                        <View style={styles.card}>
                                <Text style={styles.cardTitle}>Today's Intake</Text>
                                {waterData
                                        .filter(entry => new Date(entry.date).toDateString() === new Date().toDateString())
                                        .length > 0 ? (
                                        waterData
                                                .filter(entry => new Date(entry.date).toDateString() === new Date().toDateString())
                                                .reverse()
                                                .map((entry, index) => (
                                                        <View key={index} style={styles.historyItem}>
                                                                                                                                    <View style={styles.historyInfo}>
                                                                            <Text style={styles.historyAmount}>+{entry.amount}oz</Text>
                                                                            <Text style={styles.historyTime}>{formatTime(entry.date)}</Text>
                                                                    </View>
                                                                <Ionicons name="water" size={20} color="#4A90E2" />
                                                        </View>
                                                ))
                                ) : (
                                        <Text style={styles.noDataText}>No water intake logged today</Text>
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
                padding: 5,
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
        progressHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
        },
        cardTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
        },
        editGoalButton: {
                padding: 5,
        },
        progressContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
        },
        progressCircle: {
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#E3F2FD',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 20,
        },
        progressText: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#4A90E2',
        },
        progressInfo: {
                flex: 1,
        },
        currentAmount: {
                fontSize: 32,
                fontWeight: 'bold',
                color: '#4A90E2',
        },
        unit: {
                fontSize: 16,
                color: '#666',
                marginBottom: 5,
        },
        goalText: {
                fontSize: 14,
                color: '#999',
        },
        progressBarContainer: {
                marginBottom: 10,
        },
        progressBar: {
                height: 8,
                backgroundColor: '#E0E0E0',
                borderRadius: 4,
                overflow: 'hidden',
        },
        progressFill: {
                height: '100%',
                backgroundColor: '#4A90E2',
                borderRadius: 4,
        },
        remainingText: {
                textAlign: 'center',
                color: '#666',
                fontSize: 14,
        },
        quickAddContainer: {
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
        quickAddTitle: {
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 15,
                color: '#333',
        },
        quickAddButtons: {
                flexDirection: 'row',
                justifyContent: 'space-around',
        },
        quickAddButton: {
                backgroundColor: '#E3F2FD',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#4A90E2',
        },
        quickAddAmount: {
                color: '#4A90E2',
                fontSize: 16,
                fontWeight: '600',
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
        historyAmount: {
                fontSize: 16,
                fontWeight: '600',
                color: '#333',
        },
        historyTime: {
                fontSize: 14,
                color: '#666',
                marginTop: 2,
        },
        noDataText: {
                textAlign: 'center',
                color: '#999',
                fontStyle: 'italic',
                marginVertical: 20,
        },
});

export default WaterTrackingScreen;
