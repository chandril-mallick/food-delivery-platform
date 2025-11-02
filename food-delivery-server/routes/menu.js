const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('menu').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add new menu item
router.post('/', async (req, res) => {
  const { name, description, price, image } = req.body;
  try {
    const docRef = await admin.firestore().collection('menu').add({ name, description, price, image });
    const doc = await docRef.get();
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
