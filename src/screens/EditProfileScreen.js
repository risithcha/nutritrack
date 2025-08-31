import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNutrition } from '../context/NutritionContext';

const EditProfileScreen = ({ navigation }) => {
    const { state, updateUserProfile } = useNutrition();
    const { userProfile } = state;

    const [formData, setFormData] = useState({
        gender: userProfile.gender,
        weight: userProfile.weight.toString(),
        height: userProfile.height.toString(),
        age: userProfile.age.toString(),
        activityLevel: userProfile.activityLevel,
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.weight || isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
            newErrors.weight = 'Please enter a valid weight';
        }

        if (!formData.height || isNaN(formData.height) || parseFloat(formData.height) <= 0) {
            newErrors.height = 'Please enter a valid height';
        }

        if (!formData.age || isNaN(formData.age) || parseInt(formData.age) <= 0) {
            newErrors.age = 'Please enter a valid age';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            const updatedProfile = {
                gender: formData.gender,
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age: parseInt(formData.age),
                activityLevel: formData.activityLevel,
            };

            updateUserProfile(updatedProfile);
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Discard Changes',
            'Are you sure you want to discard your changes?',
            [
                { text: 'Keep Editing', style: 'cancel' },
                { 
                    text: 'Discard', 
                    style: 'destructive',
                    onPress: () => navigation.goBack()
                },
            ]
        );
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, keyboardType, error, unit }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.textInput, error && styles.inputError]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType={keyboardType || 'default'}
                    placeholderTextColor="#999"
                />
                {unit && <Text style={styles.unitText}>{unit}</Text>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );

    const PickerField = ({ label, value, onValueChange, items, error }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.pickerContainer, error && styles.inputError]}>
                <Picker
                    selectedValue={value}
                    onValueChange={onValueChange}
                    style={styles.picker}
                >
                    {items.map((item) => (
                        <Picker.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </Picker>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Edit Profile</Text>
                <Text style={styles.subtitle}>
                    Update your personal information for accurate nutrition calculations
                </Text>
            </View>

            <View style={styles.formContainer}>
                <PickerField
                    label="Gender"
                    value={formData.gender}
                    onValueChange={(value) => updateFormData('gender', value)}
                    items={[
                        { label: 'Female', value: 'Female' },
                        { label: 'Male', value: 'Male' },
                        { label: 'Other', value: 'Other' },
                    ]}
                    error={errors.gender}
                />

                <InputField
                    label="Weight"
                    value={formData.weight}
                    onChangeText={(value) => updateFormData('weight', value)}
                    placeholder="Enter your weight"
                    keyboardType="numeric"
                    unit="lbs"
                    error={errors.weight}
                />

                <InputField
                    label="Height"
                    value={formData.height}
                    onChangeText={(value) => updateFormData('height', value)}
                    placeholder="Enter your height"
                    keyboardType="numeric"
                    unit="inches"
                    error={errors.height}
                />

                <InputField
                    label="Age"
                    value={formData.age}
                    onChangeText={(value) => updateFormData('age', value)}
                    placeholder="Enter your age"
                    keyboardType="numeric"
                    unit="years"
                    error={errors.age}
                />

                <PickerField
                    label="Activity Level"
                    value={formData.activityLevel}
                    onValueChange={(value) => updateFormData('activityLevel', value)}
                    items={[
                        { label: 'Sedentary (little or no exercise)', value: 'sedentary' },
                        { label: 'Lightly active (light exercise 1-3 days/week)', value: 'light' },
                        { label: 'Moderately active (moderate exercise 3-5 days/week)', value: 'moderate' },
                        { label: 'Very active (hard exercise 6-7 days/week)', value: 'active' },
                        { label: 'Extremely active (very hard exercise, physical job)', value: 'veryActive' },
                    ]}
                    error={errors.activityLevel}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                    <LinearGradient
                        colors={['#4A90E2', '#357ABD']}
                        style={styles.buttonGradient}
                    >
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text style={styles.buttonText}>Update Profile</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tertiaryButton} onPress={handleCancel}>
                    <View style={styles.tertiaryButtonContent}>
                        <Ionicons name="close" size={20} color="#666" />
                        <Text style={styles.tertiaryButtonText}>Cancel</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#4A90E2" />
                <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Why this information matters</Text>
                    <Text style={styles.infoText}>
                        Your personal data helps us calculate your daily calorie needs and provide accurate nutrition recommendations.
                    </Text>
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
    formContainer: {
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
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
    },
    textInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    unitText: {
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
    },
    picker: {
        height: 50,
    },
    inputError: {
        borderColor: '#FF6B6B',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 4,
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
    tertiaryButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
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
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoCard: {
        backgroundColor: 'white',
        margin: 16,
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
});

export default EditProfileScreen;
