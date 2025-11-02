# 🍱 Dabba - Home-Style Food Delivery Platform

> Bringing the warmth of home-cooked meals to university students and food lovers everywhere.

A modern, full-stack food delivery platform specializing in authentic home-style cuisine with **FREE delivery to major university campuses**. Built with React, Firebase, and Express, featuring real-time order tracking, OTP authentication, and an integrated admin dashboard.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/chandril-mallick/food-delivery-platform)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.0-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[Live Demo](#) • [Documentation](#-documentation) • [Features](#-features) • [Contributing](./CONTRIBUTING.md) • [License](./LICENSE)

## ✨ Why Dabba?

Dabba revolutionizes food delivery for university students by combining the comfort of home-cooked meals with modern technology. Our platform eliminates delivery fees for campus orders while providing a seamless, app-like experience.

## 🌟 Key Features

### 🎓 University-First Approach
- **FREE Campus Delivery** to 5 major universities (DU, JNU, IIT Delhi, Jamia, IP University)
- **Precise Location Tracking** with department, building, and room number
- **30-Minute Delivery Guarantee** with real-time countdown timer
- **Campus-Specific Menus** tailored to student preferences

### 📱 Customer Experience
- **Native Mobile Interface** - iOS/Android-style bottom navigation and haptic feedback
- **Secure OTP Authentication** - Phone-based login powered by Supabase
- **Smart Menu System** - Real-time updates, ratings, filters, and intelligent search
- **Intuitive Cart Management** - Quantity controls with visual feedback
- **Live Order Tracking** - Real-time status updates from kitchen to doorstep
- **Complete Order History** - Track past orders and reorder favorites
- **User Profiles** - Save multiple addresses, preferences, and payment methods

### 🎛️ Admin Dashboard
- **Real-Time Analytics** - Revenue, orders, and performance metrics at a glance
- **Order Management** - Complete workflow control with status updates
- **Menu Management** - Full CRUD operations with image upload
- **Revenue Tracking** - 7-day charts and financial insights
- **Live Notifications** - Instant alerts for new orders

### 🚀 Technical Excellence
- **Real-Time Database** - Firebase Firestore for instant synchronization
- **Modern UI/UX** - Tailwind CSS with Framer Motion animations
- **Mobile-First Design** - Responsive across all devices
- **Multi-Provider Auth** - Supabase OTP + Firebase Anonymous
- **Performance Optimized** - Code splitting, lazy loading, and caching
- **Type-Safe** - PropTypes validation throughout
- **Secure** - Environment variables, Firebase rules, input validation

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
git clone https://github.com/chandril-mallick/food-delivery-platform.git
cd food-delivery-platform
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

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your help makes Dabba better.

### How to Contribute

1. **Fork the repository** and clone it locally
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Run security checks**: `./security-check.sh`
5. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description

### Contribution Guidelines

- Read our [Contributing Guide](./CONTRIBUTING.md) for detailed instructions
- Follow our [Code of Conduct](./CONTRIBUTING.md#code-of-conduct)
- Check [Security Guidelines](./SECURITY.md) before committing
- Run `./security-check.sh` to ensure no sensitive data is exposed
- Write clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/)

### Good First Issues

Look for issues labeled `good first issue` or `help wanted` to get started!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Chandril Mallick**
- GitHub: [@chandril-mallick](https://github.com/chandril-mallick)
- Project: [Food Delivery Platform](https://github.com/chandril-mallick/food-delivery-platform)

## 🙏 Acknowledgments

This project wouldn't be possible without these amazing technologies:

- **[Firebase](https://firebase.google.com/)** - Real-time database and authentication infrastructure
- **[Supabase](https://supabase.com/)** - OTP authentication and user management
- **[React](https://reactjs.org/)** - UI library for building the frontend
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide](https://lucide.dev/)** - Beautiful icon set
- **[Express](https://expressjs.com/)** - Backend web framework
- **[Flutter](https://flutter.dev/)** - Admin mobile app framework

Special thanks to the open-source community for their invaluable tools and resources.

## 📞 Support & Community

### Getting Help

- 📖 **Documentation**: Check our [comprehensive guides](#-documentation)
- 🐛 **Bug Reports**: [Create an issue](https://github.com/chandril-mallick/food-delivery-platform/issues/new)
- 💡 **Feature Requests**: [Open a discussion](https://github.com/chandril-mallick/food-delivery-platform/discussions)
- 🔒 **Security Issues**: See [SECURITY.md](./SECURITY.md) for responsible disclosure

### Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Order placement fails | Enable Firebase Anonymous Authentication in Console |
| "Missing permissions" error | Update Firestore security rules (see setup guide) |
| Supabase OTP not working | Configure SMS provider in Supabase dashboard |
| Backend connection error | Verify `serviceAccountKey.json` location and permissions |

For more help, check the browser console, Firebase Console, or Supabase Dashboard for detailed error messages.

## 📈 Roadmap

### Current Version (v1.0.0)
- ✅ Complete food delivery platform
- ✅ University delivery system (5 universities)
- ✅ Integrated admin dashboard
- ✅ Real-time order tracking
- ✅ OTP authentication
- ✅ Mobile-first responsive design

### Upcoming Features
- 🔜 Payment gateway integration (Razorpay/Stripe)
- 🔜 Push notifications for order updates
- 🔜 Loyalty program and rewards
- 🔜 Multi-language support
- 🔜 Advanced analytics dashboard
- 🔜 Customer reviews and ratings
- 🔜 Scheduled orders
- 🔜 Group ordering for events

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/chandril-mallick/food-delivery-platform?style=social)
![GitHub forks](https://img.shields.io/github/forks/chandril-mallick/food-delivery-platform?style=social)
![GitHub issues](https://img.shields.io/github/issues/chandril-mallick/food-delivery-platform)
![GitHub pull requests](https://img.shields.io/github/issues-pr/chandril-mallick/food-delivery-platform)

## 📚 Documentation

- **[Setup Guide](./PRODUCTION_SETUP.md)** - Detailed production deployment instructions
- **[Security Guidelines](./SECURITY.md)** - Security best practices and policies
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project
- **[Backend API Docs](./food-delivery-server/README.md)** - API endpoints and usage
- **[Pre-Commit Checklist](./PRE_COMMIT_CHECKLIST.md)** - Security checks before committing

## 🔄 Changelog

### v1.0.0 (January 2025)
**Initial Release** 🎉

- Complete food delivery platform with React frontend
- Express backend with Firebase integration
- University delivery system with FREE campus delivery
- Real-time order tracking with 30-minute guarantee
- OTP authentication via Supabase
- Integrated admin dashboard with analytics
- Mobile-first responsive design
- Comprehensive documentation and security guidelines

---

<div align="center">

**Made with ❤️ for home-style food lovers**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/chandril-mallick/food-delivery-platform/issues) • [Request Feature](https://github.com/chandril-mallick/food-delivery-platform/issues) • [Contribute](./CONTRIBUTING.md)

</div>
