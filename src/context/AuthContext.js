import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false); // Don't show loading screen for now

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // See if the user has filled out their profile info
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    console.log('AuthContext: User signed in, checking Firestore profile');
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        // Check if they have a profile with a non-empty name
                        if (userData.profile && userData.profile.name && userData.profile.name.trim() !== '') {
                            console.log('AuthContext: Setting user as profileComplete: true');
                            setUser({ ...user, profileComplete: true });
                        } else {
                            // Check if they have other profile fields filled (age, weight, height)
                            // This handles users who might have completed setup but have empty name
                            if (userData.profile && 
                                    (userData.profile.age || userData.profile.weight || userData.profile.height)) {
                                console.log('AuthContext: Setting user as profileComplete: true (has other profile data)');
                                setUser({ ...user, profileComplete: true });
                            } else {
                                // New users need to set up their profile first
                                console.log('AuthContext: Setting user as profileComplete: false (new user)');
                                setUser({ ...user, profileComplete: false });
                            }
                        }
                    } else {
                        // User document doesn't exist, they need to set up profile
                        console.log('AuthContext: Setting user as profileComplete: false (no document)');
                        setUser({ ...user, profileComplete: false });
                    }
                } catch (error) {
                    console.log('AuthContext: Error checking Firestore profile, assuming incomplete:', error);
                    setUser({ ...user, profileComplete: false });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Check if the user has completed their profile setup
    const refreshUserProfileStatus = async () => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // Check if they have a profile with a non-empty name
                    if (userData.profile && userData.profile.name && userData.profile.name.trim() !== '') {
                        setUser({ ...user, profileComplete: true });
                    } else {
                        // Check if they have other profile fields filled (age, weight, height)
                        if (userData.profile && 
                                (userData.profile.age || userData.profile.weight || userData.profile.height)) {
                            setUser({ ...user, profileComplete: true });
                        } else {
                            setUser({ ...user, profileComplete: false });
                        }
                    }
                } else {
                    setUser({ ...user, profileComplete: false });
                }
            } catch (error) {
                console.log('Error refreshing profile status:', error);
            }
        }
    };

    const signUp = async (email, password) => {
        try {
            console.log('Starting signup process...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Firebase auth user created:', userCredential.user.uid);
            
            try {
                // Make a new user document in Firestore
                console.log('Creating Firestore document...');
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: email,
                    createdAt: new Date(),
                    profile: {
                        name: '',
                        age: '',
                        weight: '',
                        height: '',
                        activityLevel: 'moderate',
                        goal: 'maintain',
                    },
                    dailyNutrition: {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0,
                        fiber: 0,
                        sugar: 0,
                        sodium: 0,
                    },
                    mealPlan: {
                        breakfast: [],
                        lunch: [],
                        dinner: [],
                        snacks: [],
                    },
                });
                console.log('Firestore document created successfully');
            } catch (firestoreError) {
                console.error('Firestore error (non-blocking):', firestoreError);
                // Don't throw this error - auth was successful, we can continue
            }

            return userCredential.user;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const signIn = async (email, password) => {
        try {
            console.log('AuthContext: Starting signin...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('AuthContext: Signin successful:', userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error('AuthContext: Signin error:', error);
            throw error;
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const updateUserProfile = async (userId, profileData) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                profile: profileData
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        logOut,
        updateUserProfile,
        refreshUserProfileStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 
