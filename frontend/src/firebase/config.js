// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  // v3 site key provided via env when App Check is enabled
  recaptchaV3Key: process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY
};

// Initialize Firebase app regardless of auth provider (Firestore is used across flows)
let app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
// eslint-disable-next-line no-console
console.log('[Firebase] App initialized (provider:', process.env.REACT_APP_AUTH_PROVIDER, ')');

// Initialize Firebase services
let db, auth;
if (app) {
  // Initialize App Check (reCAPTCHA v3) when enabled
  console.log('[Firebase] App Check env var:', process.env.REACT_APP_ENABLE_APPCHECK);
  
  try {
    if (process.env.REACT_APP_ENABLE_APPCHECK === 'true') {
      console.log('[Firebase] App Check is ENABLED - initializing...');
      // Optional debug token for local development
      if (process.env.REACT_APP_APPCHECK_DEBUG === 'true') {
        // eslint-disable-next-line no-underscore-dangle
        window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }

      const siteKey = process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY;
      if (siteKey) {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true
        });
        // eslint-disable-next-line no-console
        console.log('[Firebase] App Check initialized with reCAPTCHA v3');
      } else {
        // eslint-disable-next-line no-console
        console.warn('[Firebase] REACT_APP_RECAPTCHA_V3_SITE_KEY is missing; App Check not initialized');
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('[Firebase] App Check is DISABLED via env variable');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Firebase] Failed to initialize App Check:', e);
  }

  db = getFirestore(app);
  auth = getAuth(app);
  console.log('[Firebase] Firestore and Auth initialized');
}

export { app, db, auth };

export default app;
