import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FoodAnalysisScreen = ({ route, navigation }) => {
    const { foodData } = route.params;

    const getHealthScoreColor = (score) => {
        if (score >= 8) return '#4CAF50';
        if (score >= 6) return '#FF9800';
        return '#F44336';
    };

    const getHealthScoreText = (score) => {
        if (score >= 8) return 'Excellent';
        if (score >= 6) return 'Good';
        if (score >= 4) return 'Fair';
        return 'Poor';
    };

    const NutritionCard = ({ title, value, unit, color = '#4A90E2' }) => (
        <View style={styles.nutritionCard}>
            <Text style={styles.nutritionTitle}>{title}</Text>
            <Text style={[styles.nutritionValue, { color }]}>{value}</Text>
            <Text style={styles.nutritionUnit}>{unit}</Text>
        </View>
    );

    const HealthScoreCard = () => (
        <View style={styles.healthScoreCard}>
            <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.healthScoreGradient}
            >
                <Text style={styles.healthScoreTitle}>Health Score</Text>
                <View style={styles.healthScoreContent}>
                    <Text style={[
                        styles.healthScoreNumber,
                        { color: getHealthScoreColor(foodData.healthScore) }
                    ]}>
                        {foodData.healthScore}/10
                    </Text>
                    <Text style={styles.healthScoreText}>
                        {getHealthScoreText(foodData.healthScore)}
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );

    const TipsCard = () => (
        <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={24} color="#4A90E2" />
                <Text style={styles.tipsTitle}>Nutrition Tips</Text>
            </View>
            {foodData.nutritionTips && foodData.nutritionTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.tipText}>{tip}</Text>
                </View>
            ))}
        </View>
    );

    const AnalysisDetailsCard = () => (
        <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Analysis Details</Text>
            
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confidence Level:</Text>
                <Text style={styles.detailValue}>{foodData.confidence}%</Text>
            </View>
            
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Meal Type:</Text>
                <Text style={styles.detailValue}>{foodData.mealType}</Text>
            </View>
            
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Serving Size:</Text>
                <Text style={styles.detailValue}>{foodData.servingSize}</Text>
            </View>
            
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Analysis Time:</Text>
                <Text style={styles.detailValue}>
                    {new Date(foodData.timestamp).toLocaleTimeString()}
                </Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Food Analysis Results</Text>
                <Text style={styles.subtitle}>{foodData.name}</Text>
            </View>

            {foodData.imageUri && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: foodData.imageUri }} style={styles.foodImage} />
                </View>
            )}

            <HealthScoreCard />

            <View style={styles.nutritionSection}>
                <Text style={styles.sectionTitle}>Nutrition Information</Text>
                <View style={styles.nutritionGrid}>
                    <NutritionCard title="Calories" value={foodData.calories} unit="kcal" />
                    <NutritionCard title="Protein" value={foodData.protein} unit="g" color="#FF6B6B" />
                    <NutritionCard title="Carbs" value={foodData.carbs} unit="g" color="#4ECDC4" />
                    <NutritionCard title="Fat" value={foodData.fat} unit="g" color="#45B7D1" />
                    <NutritionCard title="Fiber" value={foodData.fiber || 0} unit="g" color="#9C27B0" />
                    <NutritionCard title="Sugar" value={foodData.sugar || 0} unit="g" color="#FF9800" />
                </View>
            </View>

            <TipsCard />
            <AnalysisDetailsCard />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <LinearGradient
                        colors={['#4A90E2', '#357ABD']}
                        style={styles.buttonGradient}
                    >
                        <Ionicons name="home" size={20} color="white" />
                        <Text style={styles.buttonText}>Go to Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Scan')}
                >
                    <View style={styles.secondaryButtonContent}>
                        <Ionicons name="camera" size={20} color="#666" />
                        <Text style={styles.secondaryButtonText}>Scan Another Food</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
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
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    imageContainer: {
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    foodImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    healthScoreCard: {
        margin: 16,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    healthScoreGradient: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    healthScoreTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    healthScoreContent: {
        alignItems: 'center',
    },
    healthScoreNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    healthScoreText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    nutritionSection: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    nutritionCard: {
        backgroundColor: 'white',
        width: (width - 48) / 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    nutritionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    nutritionValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    nutritionUnit: {
        fontSize: 12,
        color: '#999',
    },
    tipsCard: {
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
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tipText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    detailsCard: {
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
    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    buttonContainer: {
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
});

export default FoodAnalysisScreen;
