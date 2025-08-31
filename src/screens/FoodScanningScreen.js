import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useNutrition } from '../context/NutritionContext';
import aiService from '../services/aiService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/api';

const FoodScanningScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraType, setCameraType] = useState('back');
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { addFood } = useNutrition();

    const requestMediaLibraryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        console.log('Take photo button pressed');
        console.log('Permission status:', permission);
        
        if (!permission) {
            console.log('No permission object available');
            return;
        }
        if (!permission.granted) {
            console.log('Permission not granted, showing alert');
            Alert.alert(
                'Camera Permission Needed', 
                'Please grant camera permission to take photos.',
                [
                    {
                        text: 'Grant Permission',
                        onPress: () => requestPermission(),
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ]
            );
            return;
        }
        console.log('Setting showCamera to true');
        setShowCamera(true);
    };

    const uploadPhoto = async () => {
        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setCapturedImage(result.assets[0].uri);
                analyzeFood(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload photo. Please try again.');
        }
    };

    const handleCameraCapture = async (camera) => {
        try {
            if (!camera) {
                Alert.alert('Error', 'Camera not ready. Please try again.');
                return;
            }
            
            const photo = await camera.takePictureAsync({
                quality: 0.8,
                base64: true,
            });
            setCapturedImage(photo.uri);
            setShowCamera(false);
            analyzeFood(photo.uri);
        } catch (error) {
            console.error('Camera capture error:', error);
            Alert.alert('Error', 'Failed to capture photo. Please try again.');
        }
    };

    const analyzeFood = async (imageUri) => {
        setIsAnalyzing(true);
        
        try {
            console.log('Starting AI food analysis...');
            
            // Use the AI to figure out what food this is
            const foodData = await aiService.analyzeFoodImage(imageUri);
            
            // Get some tips about this food
            const nutritionTips = await aiService.getNutritionTips(foodData);
            
            // Add this food to today's tracking
            const foodToAdd = {
                id: Date.now(),
                name: foodData.name,
                calories: foodData.calories,
                protein: foodData.protein || 0,
                carbs: foodData.carbs || 0,
                fat: foodData.fat || 0,
                fiber: foodData.fiber || 0,
                sugar: foodData.sugar || 0,
                sodium: foodData.sodium || 0,
                healthScore: foodData.healthScore,
                mealType: foodData.mealType,
                confidence: foodData.confidence,
                imageUri: imageUri,
                timestamp: new Date().toISOString(),
                nutritionTips: nutritionTips,
            };
            
            console.log('Calling addFood with:', foodToAdd);
            addFood(foodToAdd);
            setIsAnalyzing(false);
            
            // Show the user the detailed results
            navigation.navigate('FoodAnalysis', { foodData: foodToAdd });
            
        } catch (error) {
            setIsAnalyzing(false);
            console.error('Food analysis error:', error);
            
            // See if the AI said this isn't actually food
            if (error.message === 'NOT_FOOD') {
                Alert.alert(
                    'Not a Food Item',
                    ERROR_MESSAGES.notFood,
                    [
                        {
                            text: 'Try Again',
                            onPress: () => setCapturedImage(null),
                        },
                    ]
                );
                return;
            }
            
            // Use estimated data if the AI fails for some other reason
            const mockFoodData = {
                id: Date.now(),
                name: 'Food Item',
                calories: 250,
                protein: 15,
                carbs: 30,
                fat: 8,
                fiber: 5,
                sugar: 10,
                sodium: 300,
                healthScore: 7,
                mealType: 'meal',
                confidence: 85,
                imageUri: imageUri,
                timestamp: new Date().toISOString(),
                nutritionTips: [
                    'This appears to be a balanced food item.',
                    'Consider portion size for accurate tracking.',
                    'Pair with vegetables for a complete meal.'
                ],
            };
            
            console.log('Calling addFood with mock data:', mockFoodData);
            addFood(mockFoodData);
            
            Alert.alert(
                'AI Analysis Unavailable',
                'Using estimated nutrition data. The AI service is currently unavailable.',
                [
                    {
                        text: 'View Results',
                        onPress: () => navigation.navigate('FoodAnalysis', { foodData: mockFoodData }),
                    },
                    {
                        text: 'Try Again',
                        onPress: () => setCapturedImage(null),
                    },
                ]
            );
        }
    };

        const CameraScreen = () => {
        const [camera, setCamera] = useState(null);

        return (
            <View style={styles.cameraContainer}>
                <CameraView 
                    style={styles.camera} 
                    facing={cameraType}
                    ref={(ref) => setCamera(ref)}
                />
                <View style={styles.cameraOverlay}>
                    <View style={styles.cameraHeader}>
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={() => setShowCamera(false)}
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.cameraTitle}>Take Photo</Text>
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={() => setCameraType(
                                cameraType === 'back' ? 'front' : 'back'
                            )}
                        >
                            <Ionicons name="camera-reverse" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.cameraFrame}>
                        <View style={styles.corner} />
                        <View style={[styles.corner, styles.cornerTopRight]} />
                        <View style={[styles.corner, styles.cornerBottomLeft]} />
                        <View style={[styles.corner, styles.cornerBottomRight]} />
                    </View>
                    
                    <View style={styles.cameraFooter}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={() => camera && handleCameraCapture(camera)}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (showCamera) {
        console.log('Rendering CameraScreen');
        return <CameraScreen />;
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Scan Your Food</Text>
                <Text style={styles.subtitle}>
                    Take a photo or upload an image to automatically log your food
                </Text>
            </View>

            {capturedImage && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                    {isAnalyzing && (
                        <View style={styles.analyzingOverlay}>
                            <ActivityIndicator size="large" color="#4A90E2" />
                            <Text style={styles.analyzingText}>Analyzing food...</Text>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
                    <LinearGradient
                        colors={['#4A90E2', '#357ABD']}
                        style={styles.buttonGradient}
                    >
                        <Ionicons name="camera" size={28} color="white" />
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tertiaryButton} onPress={uploadPhoto}>
                    <View style={styles.tertiaryButtonContent}>
                        <Ionicons name="images" size={28} color="#666" />
                        <Text style={styles.tertiaryButtonText}>Upload Photo</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#4A90E2" />
                <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>How it works</Text>
                    <Text style={styles.infoText}>
                        Our AI analyzes your food photo and automatically calculates calories, protein, carbs, and fat content.
                    </Text>
                </View>
            </View>

            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>Tips for better results:</Text>
                <View style={styles.tipsList}>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.tipText}>Ensure good lighting</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.tipText}>Include the entire meal in frame</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.tipText}>Avoid shadows and reflections</Text>
                    </View>
                </View>
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
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    previewContainer: {
        margin: 20,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    analyzingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    analyzingText: {
        color: 'white',
        fontSize: 16,
        marginTop: 12,
    },
    buttonContainer: {
        padding: 20,
        gap: 16,
    },
    primaryButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    tertiaryButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tertiaryButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tertiaryButtonText: {
        color: '#666',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 12,
    },
    infoCard: {
        backgroundColor: 'white',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    tipsCard: {
        backgroundColor: 'white',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    cameraHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
    },
    cameraButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cameraFrame: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: 'white',
        top: '30%',
        left: '20%',
    },
    cornerTopRight: {
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderLeftWidth: 0,
        left: 'auto',
        right: '20%',
    },
    cornerBottomLeft: {
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderTopWidth: 0,
        top: 'auto',
        bottom: '30%',
    },
    cornerBottomRight: {
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        top: 'auto',
        left: 'auto',
        bottom: '30%',
        right: '20%',
    },
    cameraFooter: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
});

export default FoodScanningScreen;
