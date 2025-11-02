import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

class AuthService {
  constructor() {
    this.recaptchaVerifier = null;
  }

  // Initialize reCAPTCHA verifier
  initializeRecaptcha(containerId = 'recaptcha-container') {
    // Always create a fresh verifier to avoid stale tokens
    this.cleanupRecaptcha();
    
    // Check if container exists in DOM - don't create it if missing
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const container = document.getElementById(containerId);
        if (!container) {
          console.warn(`reCAPTCHA container '${containerId}' not found in DOM. Make sure it exists in your component.`);
          throw new Error(`reCAPTCHA container '${containerId}' not found`);
        }
      }
    } catch (error) {
      console.warn('DOM container check failed:', error);
      throw error;
    }

    try {
      // Firebase v9 modular API: RecaptchaVerifier(auth, containerId, parameters)
      this.recaptchaVerifier = new RecaptchaVerifier(
        auth, // First parameter: auth instance
        containerId, // Second parameter: container ID
        {
          size: 'normal', // Keep visible for Identity Platform debugging
          theme: 'light',
          callback: (response) => {
            console.log('reCAPTCHA solved, response length:', response?.length);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired, recreating...');
            this.cleanupRecaptcha();
          },
          'error-callback': (error) => {
            console.error('reCAPTCHA error:', error);
          }
        }
      );

      console.log('RecaptchaVerifier created successfully for Identity Platform');
      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Failed to create RecaptchaVerifier:', error);
      throw error;
    }
  }

  // Cleanup reCAPTCHA
  cleanupRecaptcha() {
    if (this.recaptchaVerifier && typeof this.recaptchaVerifier.clear === 'function') {
      try {
        this.recaptchaVerifier.clear();
      } catch (_) {
        // ignore
      }
    }
    this.recaptchaVerifier = null;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber) {
    try {
      // Ensure phone number is in E.164 format
      const digitsOnly = (phoneNumber || '').replace(/\D/g, '');
      let formattedPhone = '';
      if (digitsOnly.startsWith('91')) {
        formattedPhone = `+${digitsOnly}`;
      } else if (phoneNumber.startsWith('+')) {
        formattedPhone = `+${digitsOnly}`;
      } else {
        formattedPhone = `+91${digitsOnly}`;
      }

      console.log('Identity Platform: Attempting to send OTP to:', formattedPhone);

      // Create fresh reCAPTCHA verifier with explicit render
      const recaptchaVerifier = this.initializeRecaptcha();
      
      // Wait for reCAPTCHA to fully render before proceeding
      try {
        await recaptchaVerifier.render();
        console.log('reCAPTCHA rendered successfully');
      } catch (renderError) {
        console.warn('reCAPTCHA render warning:', renderError);
      }

      // Add a small delay to ensure reCAPTCHA is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Identity Platform: RecaptchaVerifier ready, attempting signInWithPhoneNumber...');
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);

      console.log('Identity Platform: OTP sent successfully');
      return {
        success: true,
        confirmationResult,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Identity Platform Error sending OTP:', {
        code: error?.code,
        message: error?.message,
        data: error?.customData,
        stack: error?.stack
      });
      
      // Provide more specific error messages for Identity Platform
      let userMessage = 'Failed to send OTP';
      if (error?.code === 'auth/invalid-app-credential') {
        userMessage = 'Identity Platform: App credentials invalid. This may be due to reCAPTCHA configuration or project settings.';
      } else if (error?.code === 'auth/captcha-check-failed') {
        userMessage = 'reCAPTCHA verification failed. Please complete the reCAPTCHA and try again.';
      } else if (error?.code === 'auth/invalid-phone-number') {
        userMessage = 'Invalid phone number format. Please check and try again.';
      } else if (error?.code === 'auth/quota-exceeded') {
        userMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error?.code === 'auth/too-many-requests') {
        userMessage = '🎉 Phone auth is working! Rate limit reached - please wait 15-30 minutes or try a different phone number.';
      }

      return {
        success: false,
        error: userMessage,
        errorCode: error?.code
      };
    }
  }

  // Verify OTP and complete login
  async verifyOTP(confirmationResult, otp) {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Create/update profile
      await this.createOrUpdateUserProfile(user);

      return {
        success: true,
        user,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Invalid OTP. Please try again.'
      };
    }
  }

  // Create or update user profile in Firestore
  async createOrUpdateUserProfile(user, additionalData = {}) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const userData = {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        lastLogin: new Date(),
        updatedAt: new Date(),
        ...additionalData
      };

      if (!userSnap.exists()) {
        // Create profile
        userData.createdAt = new Date();
        userData.name = additionalData.name || '';
        userData.email = additionalData.email || '';
        userData.addresses = [];
        userData.orderHistory = [];

        await setDoc(userRef, userData);
      } else {
        // Update profile
        await updateDoc(userRef, userData);
      }

      return userData;
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update profile
  async updateUserProfile(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        ...profileData,
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);

      if (profileData.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.name
        });
      }

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add address
  async addAddress(userId, address) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const addresses = userData.addresses || [];

        const newAddress = {
          id: Date.now().toString(),
          ...address,
          createdAt: new Date()
        };

        addresses.push(newAddress);

        await updateDoc(userRef, {
          addresses,
          updatedAt: new Date()
        });

        return {
          success: true,
          address: newAddress,
          message: 'Address added successfully'
        };
      }
    } catch (error) {
      console.error('Error adding address:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.recaptchaVerifier = null;
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Error logging out:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Full cleanup
  cleanup() {
    if (this.recaptchaVerifier) {
      if (typeof this.recaptchaVerifier.clear === 'function') {
        this.recaptchaVerifier.clear();
      }
      this.recaptchaVerifier = null;
    }
  }
}

const authService = new AuthService();
export default authService;
