# 🍱 Dabba - Home-Style Food Delivery App

A comprehensive food delivery platform offering authentic home-style meals with a focus on university campuses. Built with React, Firebase, and Express.

![Dabba App](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.12.0-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Customer Features
- 📱 **Native Mobile Experience** - App-like interface with bottom navigation
- 🔐 **OTP Authentication** - Secure phone-based login via Supabase
- 🍽️ **Dynamic Menu** - Real-time menu with ratings, filters, and search
- 🛒 **Smart Cart** - Quantity management with haptic feedback
- 🎓 **University Delivery** - FREE delivery to major university campuses
- 📦 **Real-time Order Tracking** - Live order status with 30-minute delivery timer
- 📜 **Order History** - Complete order management and tracking
- 👤 **User Profiles** - Save addresses, preferences, and payment methods
- ⭐ **Favorites** - Save favorite dishes for quick reordering

### Admin Features
- 📊 **Dashboard** - Real-time statistics and analytics
- 📋 **Order Management** - Complete order workflow management
- 🍴 **Menu Management** - Full CRUD operations for menu items
- 📈 **Analytics** - Revenue tracking and performance metrics
- 🔄 **Real-time Updates** - Live order status synchronization

### Technical Highlights
- ⚡ **Real-time Database** - Firebase Firestore for instant updates
- 🎨 **Modern UI** - Tailwind CSS with Framer Motion animations
- 📱 **Responsive Design** - Mobile-first approach
- 🔒 **Secure Authentication** - Multi-provider auth (Supabase + Firebase)
- 🚀 **Performance Optimized** - Code splitting and lazy loading
- 🎯 **Type Safety** - PropTypes validation

## 🏗️ Project Structure

```
dabba-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, Cart)
│   │   ├── firebase/       # Firebase configuration and services
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # Business logic services
│   └── public/             # Static assets
│
├── food-delivery-server/    # Express backend API
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   └── config/             # Configuration files
│
├── Admin_app/              # Flutter admin mobile app
│   └── dabba_admin/        # Admin app source
│
└── functions/              # Firebase Cloud Functions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase account
- Supabase account (for OTP authentication)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dabba-app.git
cd dabba-app
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your Firebase and Supabase credentials:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Auth Provider
REACT_APP_AUTH_PROVIDER=supabase
```

```bash
# Start development server
npm start
```

### 3. Backend Setup

```bash
cd food-delivery-server
npm install

# Download Firebase Admin SDK key
# 1. Go to Firebase Console > Project Settings > Service Accounts
# 2. Click "Generate New Private Key"
# 3. Save as serviceAccountKey.json in this directory

# Start server
npm start
```

### 4. Firebase Configuration

#### Enable Anonymous Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Authentication → Sign-in method
3. Enable **Anonymous** provider

#### Update Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /menuItems/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        userId == request.auth.uid;
    }
  }
}
```

### 5. Supabase Configuration

1. Create a new Supabase project
2. Enable Phone authentication
3. Configure SMS provider (Twilio recommended)
4. Copy your project URL and anon key to `.env`

## 📱 Running the App

### Development Mode
```bash
# Frontend (http://localhost:3000)
cd frontend && npm start

# Backend (http://localhost:4000)
cd food-delivery-server && npm start
```

### Production Build
```bash
cd frontend
npm run build
```

## 🎯 Key Features Explained

### University Delivery System
- **5 Major Universities**: DU, JNU, IIT Delhi, Jamia, IP University
- **Detailed Campus Information**: Department, building, room number
- **FREE Campus Delivery**: No delivery charges for university orders
- **Precise Location**: Dropdown-based campus and location selection

### Order Management
- **30-Minute Delivery**: Fast delivery with real-time countdown
- **Order Tracking**: Live status updates (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
- **Order History**: Complete order management with filtering
- **Cancellation**: Easy order cancellation before preparation

### Admin Panel
- **Integrated Dashboard**: No separate admin app needed
- **Real-time Statistics**: Orders, revenue, and performance metrics
- **Order Management**: Update status, view details, manage orders
- **Menu Management**: Add, edit, delete menu items with images

## 🔒 Security

### Critical Files (NEVER COMMIT)
- ❌ `serviceAccountKey.json` - Firebase Admin SDK private key
- ❌ `.env` files - Environment variables with API keys
- ❌ `firebase-adminsdk*.json` - Any Firebase admin credentials

### Security Checklist
- ✅ All sensitive files in `.gitignore`
- ✅ Environment variables for all API keys
- ✅ Firebase security rules configured
- ✅ HTTPS in production
- ✅ Input validation on all forms
- ✅ Rate limiting for OTP requests

## 📦 Tech Stack

### Frontend
- **React 18.2** - UI library
- **React Router 6** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Express 5** - Web framework
- **Firebase Admin** - Server-side Firebase
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Database & Auth
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - Anonymous auth
- **Supabase** - OTP authentication
- **Firebase Storage** - File storage

### Admin App
- **Flutter** - Cross-platform mobile framework

## 🌐 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
cd food-delivery-server
# Add Procfile: web: node index.js
# Deploy with your platform's CLI
```

### Firebase Hosting
```bash
firebase deploy
```

## 📊 Database Structure

### Collections
- **menuItems** - Menu items with pricing, ratings, images
- **orders** - Order details with user, items, status
- **users** - User profiles with addresses, preferences
- **popular menu** - Featured dishes for home page

## 🐛 Troubleshooting

### Order placement fails
- **Solution**: Enable Firebase Anonymous Authentication

### "Missing or insufficient permissions"
- **Solution**: Update Firestore security rules

### Supabase OTP not working
- **Solution**: Configure SMS provider in Supabase dashboard

### Backend can't connect to Firebase
- **Solution**: Ensure `serviceAccountKey.json` is in the correct location

## 📝 Environment Variables

### Frontend (.env)
```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_AUTH_PROVIDER=supabase
```

### Backend (.env)
```env
PORT=4000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Supabase for authentication
- Tailwind CSS for styling
- Lucide for icons
- Create React App for project setup

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check browser console for errors
- Review Firebase Console for auth/database issues
- Check Supabase Dashboard for authentication issues

## 🔄 Version History

- **1.0.0** (2025-01) - Initial release
  - Complete food delivery platform
  - University delivery system
  - Admin panel integration
  - Real-time order tracking
  - OTP authentication

---

**Made with ❤️ for home-style food lovers**
