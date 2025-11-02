# 🚀 Dabba Food Delivery Server

Express.js backend API for the Dabba food delivery application with Firebase Admin SDK integration.

## 📋 Overview

This is the backend server for the Dabba food delivery app, providing RESTful APIs for menu management, cart operations, and order processing. It uses Firebase Admin SDK for authentication and database operations.

## 🛠️ Tech Stack

- **Express 5.1.0** - Web framework
- **Firebase Admin 12.0.0** - Server-side Firebase SDK
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
food-delivery-server/
├── config/              # Configuration files
├── middleware/          # Express middleware
│   └── firebaseAuth.js # Firebase authentication middleware
├── models/             # Data models
├── routes/             # API routes
│   ├── menu.js        # Menu endpoints
│   ├── cart.js        # Cart endpoints
│   └── order.js       # Order endpoints
├── scripts/           # Utility scripts
│   └── seedMenu.js    # Database seeding script
├── index.js           # Main server file
├── package.json       # Dependencies
└── .env.example       # Environment variables template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Firebase project with Admin SDK access

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Get Firebase Admin SDK Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Save the file as `serviceAccountKey.json` in the root directory

   ⚠️ **IMPORTANT**: Never commit this file to version control!

3. **Configure Environment Variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=4000
```

4. **Start the Server**
```bash
npm start
```

The server will run on `http://localhost:4000`

## 🔌 API Endpoints

### Public Endpoints

#### GET /
- **Description**: Health check endpoint
- **Response**: `"Food Delivery API running"`

#### GET /api/menu
- **Description**: Get all menu items
- **Response**: Array of menu items
- **Example**:
```json
[
  {
    "id": "1",
    "name": "Maa Ka Dal Chawal",
    "price": 149,
    "rating": 4.9,
    "image": "🍛",
    "category": "Main Course",
    "isVeg": true
  }
]
```

### Protected Endpoints (Require Authentication)

All protected endpoints require a valid Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

#### POST /api/cart
- **Description**: Add item to cart
- **Body**: Cart item details
- **Response**: Updated cart

#### GET /api/cart
- **Description**: Get user's cart
- **Response**: Cart items array

#### DELETE /api/cart/:itemId
- **Description**: Remove item from cart
- **Params**: `itemId` - Item to remove
- **Response**: Updated cart

#### POST /api/order
- **Description**: Create new order
- **Body**: Order details
- **Response**: Created order with ID

#### GET /api/order
- **Description**: Get user's orders
- **Response**: Array of orders

#### GET /api/order/:orderId
- **Description**: Get specific order details
- **Params**: `orderId` - Order ID
- **Response**: Order details

#### PUT /api/order/:orderId
- **Description**: Update order status
- **Params**: `orderId` - Order ID
- **Body**: `{ "status": "confirmed" }`
- **Response**: Updated order

## 🔐 Authentication

The server uses Firebase Admin SDK for authentication. The `firebaseAuth` middleware verifies Firebase ID tokens:

```javascript
// middleware/firebaseAuth.js
const admin = require('firebase-admin');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## 🗄️ Database

The server uses Firebase Firestore for data storage with the following collections:

- **menuItems** - Menu items catalog
- **orders** - Customer orders
- **users** - User profiles
- **carts** - Shopping carts (optional)

## 🌱 Seeding Data

To populate the database with sample menu items:

```bash
node scripts/seedMenu.js
```

This will add sample dishes to your Firestore database.

## 🔒 Security

### Critical Files
- ❌ **serviceAccountKey.json** - NEVER commit this file
- ❌ **.env** - Keep environment variables private

### Security Best Practices
1. Always use `.gitignore` to exclude sensitive files
2. Use environment variables for configuration
3. Validate all user inputs
4. Implement rate limiting for production
5. Use HTTPS in production
6. Keep dependencies updated

### Firestore Security Rules
Ensure your Firestore has proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /menuItems/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### Heroku
```bash
# Create Procfile
echo "web: node index.js" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables in Production
Set these in your hosting platform:
- `PORT` - Server port (usually auto-assigned)
- Upload `serviceAccountKey.json` securely or use environment variables

## 🧪 Testing

### Manual Testing with cURL

**Get Menu Items**
```bash
curl http://localhost:4000/api/menu
```

**Create Order (with auth token)**
```bash
curl -X POST http://localhost:4000/api/order \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "1", "quantity": 2}],
    "deliveryAddress": "123 Main St",
    "totalAmount": 298
  }'
```

## 📊 Error Handling

The server returns standard HTTP status codes:

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **500** - Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## 🔧 Configuration

### Port Configuration
Default port is 4000. Change in `.env`:
```env
PORT=5000
```

### CORS Configuration
Currently allows all origins. For production, restrict to your frontend domain:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

## 📝 Scripts

- `npm start` - Start the server
- `node scripts/seedMenu.js` - Seed database with sample data

## 🐛 Troubleshooting

### Server won't start
- Check if port 4000 is already in use
- Verify `serviceAccountKey.json` exists and is valid
- Check Firebase project configuration

### Authentication errors
- Verify Firebase ID token is valid
- Check token hasn't expired (tokens expire after 1 hour)
- Ensure Firebase Admin SDK is properly initialized

### Database connection issues
- Verify `serviceAccountKey.json` has correct permissions
- Check Firebase project ID matches
- Ensure Firestore is enabled in Firebase Console

## 📞 Support

For issues:
1. Check server logs for error messages
2. Verify Firebase Console for service status
3. Review Firestore security rules
4. Check network connectivity

## 🔄 Version History

- **1.0.0** (2025-01) - Initial release
  - Express server setup
  - Firebase Admin SDK integration
  - Menu, Cart, and Order APIs
  - Authentication middleware

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Dabba Food Delivery**
