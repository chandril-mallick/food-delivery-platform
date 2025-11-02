require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firebase initialized above; no DB connection function required.

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID token
const auth = require('./middleware/firebaseAuth');

// Routes
// Authentication is handled client-side with Firebase; no /api/auth route needed.
app.use('/api/menu', require('./routes/menu'));
app.use('/api/cart', auth, require('./routes/cart'));
app.use('/api/order', auth, require('./routes/order'));

app.get('/', (req, res) => res.send('Food Delivery API running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
