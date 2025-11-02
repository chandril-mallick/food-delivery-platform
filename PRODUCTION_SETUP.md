# Dabba App - Production Setup Guide

## 🚀 Production Readiness Checklist

### 1. Firebase Configuration (CRITICAL)

#### Enable Anonymous Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dabbabot-85186`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Anonymous** provider
5. Click **Save**

**Why needed**: The app uses Supabase for OTP auth but requires Firebase anonymous auth for Firestore write permissions.

#### Firestore Security Rules
Update your Firestore rules to allow authenticated users (including anonymous):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Allow authenticated users to read menu items
    match /menuItems/{itemId} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to manage their profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        userId == request.auth.uid;
    }
    
    // Admin access (adjust based on your admin setup)
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### 2. Environment Variables

#### Required Variables
Ensure all these are set in your `.env` file:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyC6aOy5iTmZvDEK7Dwf5ElSZD7GbSoIs9A
REACT_APP_FIREBASE_AUTH_DOMAIN=dabbabot-85186.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=dabbabot-85186
REACT_APP_FIREBASE_STORAGE_BUCKET=dabbabot-85186.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=510798810359
REACT_APP_FIREBASE_APP_ID=1:510798810359:web:34b36a50c9e9f1709d97f2
REACT_APP_FIREBASE_MEASUREMENT_ID=G-BJ0PTZR0W7

# Authentication Provider
REACT_APP_AUTH_PROVIDER=supabase

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://jmmrvgbnendzgpqqwhux.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Check (Disabled for Supabase flow)
REACT_APP_ENABLE_APPCHECK=false

# Development Features (Disable in production)
REACT_APP_ENABLE_DEV=false
```

#### Production Environment Variables
For production deployment, ensure:
- All sensitive keys are properly secured
- `REACT_APP_ENABLE_DEV=false`
- Consider enabling App Check for production if needed

### 3. Supabase Configuration

#### Phone Authentication Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Settings**
3. Enable **Phone** provider
4. Configure SMS provider (Twilio recommended)
5. Set up phone number verification

#### Row Level Security (RLS)
Enable RLS on your Supabase tables if using Supabase for data storage.

### 4. Testing Checklist

#### Core Functionality
- [ ] User registration with OTP
- [ ] User login with OTP
- [ ] Menu browsing
- [ ] Add items to cart
- [ ] Place order successfully
- [ ] Real-time order tracking
- [ ] Order history view
- [ ] User profile management

#### Error Handling
- [ ] Network failure scenarios
- [ ] Invalid OTP handling
- [ ] Empty cart scenarios
- [ ] Payment failures
- [ ] Order placement failures

### 5. Performance Optimization

#### Code Splitting
Implement lazy loading for better performance:

```javascript
const LazyComponent = React.lazy(() => import('./Component'));
```

#### Bundle Analysis
Run bundle analyzer to identify large dependencies:

```bash
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### 6. Security Considerations

#### API Keys
- Never expose Firebase private keys
- Use environment variables for all sensitive data
- Implement proper CORS policies

#### Authentication
- Validate all user inputs
- Implement rate limiting for OTP requests
- Use HTTPS in production

### 7. Monitoring & Analytics

#### Error Tracking
Consider implementing error tracking:
- Sentry for error monitoring
- Firebase Analytics for user behavior
- Custom logging for critical operations

#### Performance Monitoring
- Firebase Performance Monitoring
- Web Vitals tracking
- Real User Monitoring (RUM)

### 8. Deployment

#### Build Process
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Deploy to hosting service
# (Netlify, Vercel, Firebase Hosting, etc.)
```

#### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Firebase Anonymous Auth enabled
- [ ] Firestore rules updated
- [ ] Supabase phone auth configured
- [ ] Production build tested locally
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations

### 9. Post-deployment Monitoring

#### Health Checks
- Monitor order placement success rate
- Track authentication success rate
- Monitor Firebase/Supabase connection status
- Check real-time features functionality

#### User Experience
- Monitor page load times
- Track conversion rates
- Monitor error rates
- User feedback collection

## 🔧 Quick Production Check

Visit `/production-check` in your app to run automated production readiness tests.

## 🆘 Troubleshooting

### Common Issues

1. **Order placement fails with "auth/admin-restricted-operation"**
   - Solution: Enable Firebase Anonymous Authentication

2. **"Missing or insufficient permissions" in Firestore**
   - Solution: Update Firestore security rules

3. **Supabase OTP not working**
   - Solution: Configure SMS provider in Supabase dashboard

4. **Real-time updates not working**
   - Solution: Check Firestore connection and rules

### Support
For issues, check:
1. Browser console for errors
2. Firebase Console for auth/database issues
3. Supabase Dashboard for authentication issues
4. Network tab for API failures

## 📊 Production Metrics

Monitor these key metrics:
- Order completion rate
- Authentication success rate
- Page load times
- Error rates
- User retention
- Real-time feature performance

---

**Last Updated**: January 2025
**Version**: 1.0.0
