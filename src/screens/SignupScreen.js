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
import { useAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signUp } = useAuth();

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            console.log('SignupScreen: Starting signup...');
            
            // Don't let it hang forever
            const signupPromise = signUp(email, password);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Signup timeout')), 30000)
            );
            
            const user = await Promise.race([signupPromise, timeoutPromise]);
            console.log('SignupScreen: Signup successful, navigating to profile setup');
            console.log('Available routes:', navigation.getState().routeNames);
            
            // Send them to set up their profile
            navigation.push('PersonalInfoSetup', { 
                userEmail: user.email,
                userId: user.uid 
            });
        } catch (error) {
            console.error('SignupScreen: Signup error:', error);
            let errorMessage = 'Signup failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'An account with this email already exists.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = `Signup failed: ${error.message}`;
            }
            Alert.alert('Signup Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                    <Ionicons name="person-add" size={80} color="white" />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join NutriTrack</Text>
                </LinearGradient>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons 
                                name={showPassword ? "eye-off" : "eye"} 
                                size={20} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons 
                                name={showConfirmPassword ? "eye-off" : "eye"} 
                                size={20} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#4CAF50', '#45A049']}
                            style={styles.signupGradient}
                        >
                            <Text style={styles.signupText}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
                        </Text>
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
    form: {
        padding: 20,
        flex: 1,
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
    eyeIcon: {
        padding: 5,
    },
    signupButton: {
        marginTop: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    signupGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    signupText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
        color: '#666',
    },
    loginTextBold: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
});

export default SignupScreen;
