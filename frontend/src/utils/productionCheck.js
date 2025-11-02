// Production readiness checker for Dabba App
export const ProductionChecker = {
  // Check environment variables
  checkEnvironment: () => {
    const issues = [];
    
    // Firebase config
    const firebaseVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID',
      'REACT_APP_FIREBASE_STORAGE_BUCKET',
      'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
      'REACT_APP_FIREBASE_APP_ID'
    ];
    
    firebaseVars.forEach(varName => {
      if (!process.env[varName]) {
        issues.push(`Missing Firebase environment variable: ${varName}`);
      }
    });
    
    // Supabase config
    const supabaseVars = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY'
    ];
    
    supabaseVars.forEach(varName => {
      if (!process.env[varName]) {
        issues.push(`Missing Supabase environment variable: ${varName}`);
      }
    });
    
    // Auth provider
    if (!process.env.REACT_APP_AUTH_PROVIDER) {
      issues.push('Missing REACT_APP_AUTH_PROVIDER');
    }
    
    return issues;
  },
  
  // Check Firebase connection
  checkFirebaseConnection: async () => {
    try {
      const { db } = await import('../firebase/config.js');
      const { collection, getDocs, limit, query } = await import('firebase/firestore');
      
      // Test Firestore connection
      await getDocs(query(collection(db, 'orders'), limit(1)));
      return { success: true, message: 'Firebase Firestore connected' };
    } catch (error) {
      return { success: false, message: `Firebase connection failed: ${error.message}` };
    }
  },
  
  // Check Supabase connection
  checkSupabaseConnection: async () => {
    try {
      const { supabase } = await import('../lib/supabaseClient.js');
      const { error } = await supabase.auth.getSession();
      
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }
      
      return { success: true, message: 'Supabase connected' };
    } catch (error) {
      return { success: false, message: `Supabase connection failed: ${error.message}` };
    }
  },
  
  // Check authentication flow
  checkAuthFlow: async () => {
    try {
      const { default: supabaseAuthService } = await import('../services/supabaseAuthService.js');
      
      // Test if auth service is properly initialized
      if (!supabaseAuthService.sendOTP) {
        throw new Error('Supabase auth service not properly initialized');
      }
      
      return { success: true, message: 'Authentication service ready' };
    } catch (error) {
      return { success: false, message: `Auth flow check failed: ${error.message}` };
    }
  },
  
  // Run all checks
  runAllChecks: async () => {
    console.log('🔍 Running production readiness checks...');
    
    const results = {
      environment: ProductionChecker.checkEnvironment(),
      firebase: await ProductionChecker.checkFirebaseConnection(),
      supabase: await ProductionChecker.checkSupabaseConnection(),
      auth: await ProductionChecker.checkAuthFlow()
    };
    
    const allPassed = results.environment.length === 0 && 
                     results.firebase.success && 
                     results.supabase.success && 
                     results.auth.success;
    
    console.log('📊 Production Readiness Results:', results);
    
    return {
      passed: allPassed,
      results
    };
  }
};

export default ProductionChecker;
