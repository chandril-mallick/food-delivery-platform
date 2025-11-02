import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Dynamic provider selection based on environment
  const provider = process.env.REACT_APP_AUTH_PROVIDER || 'firebase';
  
  // Dynamic import of auth service based on provider
  const [authService, setAuthService] = useState(null);

  useEffect(() => {
    const loadAuthService = async () => {
      try {
        if (provider === 'supabase') {
          const { default: supabaseAuthService } = await import('../services/supabaseAuthService');
          setAuthService(supabaseAuthService);
        } else {
          const { default: firebaseAuthService } = await import('../services/authService');
          setAuthService(firebaseAuthService);
        }
      } catch (error) {
        console.error('Error loading auth service:', error);
        setLoading(false);
      }
    };

    loadAuthService();
  }, [provider]);

  useEffect(() => {
    if (!authService) return;

    let unsubscribe;

    const setupAuthListener = async () => {
      try {
        if (provider === 'supabase') {
          // Supabase auth state listener
          unsubscribe = await authService.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            setIsAuthenticated(!!currentUser);

            if (currentUser) {
              try {
                const profile = await authService.getUserProfile(currentUser.id);
                setUserProfile(profile);
              } catch (error) {
                console.error('Error fetching user profile:', error);
              }
            } else {
              setUserProfile(null);
            }

            setLoading(false);
          });
        } else {
          // Firebase auth state listener
          unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            setIsAuthenticated(!!currentUser);

            if (currentUser) {
              try {
                const profile = await authService.getUserProfile(currentUser.uid);
                setUserProfile(profile);
              } catch (error) {
                console.error('Error fetching user profile:', error);
              }
            } else {
              setUserProfile(null);
            }

            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      if (unsubscribe) {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        } else if (unsubscribe.unsubscribe) {
          unsubscribe.unsubscribe();
        }
      }
      if (authService.cleanup) {
        authService.cleanup();
      }
    };
  }, [authService, provider]);

  // Send OTP to phone number
  const sendOTP = async (phoneNumber) => {
    if (!authService) {
      return { success: false, error: 'Auth service not loaded' };
    }
    return await authService.sendOTP(phoneNumber);
  };

  // Verify OTP and complete login
  const verifyOTP = async (arg1, otp) => {
    if (!authService) {
      return { success: false, error: 'Auth service not loaded' };
    }
    
    if (provider === 'supabase') {
      // For Supabase: arg1 is phone number
      const result = await authService.verifyOTP(arg1, otp);
      if (result.success) {
        // User will be set via auth state listener
      }
      return result;
    } else {
      // For Firebase: arg1 is confirmationResult
      const result = await authService.verifyOTP(arg1, otp);
      if (result.success) {
        // User will be set via auth state listener
      }
      return result;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    if (!user || !authService) return { success: false, error: 'User not authenticated or auth service not loaded' };
    
    const userId = provider === 'supabase' ? user.id : user.uid;
    const result = await authService.updateUserProfile(userId, profileData);
    if (result.success) {
      const updatedProfile = await authService.getUserProfile(userId);
      setUserProfile(updatedProfile);
    }
    return result;
  };

  // Add address
  const addAddress = async (address) => {
    if (!user || !authService) return { success: false, error: 'User not authenticated or auth service not loaded' };
    
    const userId = provider === 'supabase' ? user.id : user.uid;
    const result = await authService.addAddress(userId, address);
    if (result.success) {
      const updatedProfile = await authService.getUserProfile(userId);
      setUserProfile(updatedProfile);
    }
    return result;
  };

  // Logout
  const logout = async () => {
    if (!authService) return { success: false, error: 'Auth service not loaded' };
    
    const result = await authService.logout();
    if (result.success) {
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    }
    return result;
  };

  // Check if user is authenticated (for order protection)
  const requireAuth = () => {
    return isAuthenticated;
  };

  const value = {
    user,
    userProfile,
    isAuthenticated,
    loading,
    provider,
    sendOTP,
    verifyOTP,
    updateProfile,
    addAddress,
    logout,
    requireAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
