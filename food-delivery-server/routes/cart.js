const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Get cart by userId
router.get('/:userId', async (req, res) => {
  try {
    const cartDoc = await admin.firestore().collection('carts').doc(req.params.userId).get();
    res.json(cartDoc.exists ? cartDoc.data() : { items: [] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add item to cart
router.post('/:userId', async (req, res) => {
  const { menuItemId, quantity } = req.body;
  try {
    const cartRef = admin.firestore().collection('carts').doc(req.params.userId);
    const cartSnapshot = await cartRef.get();
    let items = [];
    if (cartSnapshot.exists) {
      items = cartSnapshot.data().items || [];
    }
    const index = items.findIndex(i => i.menuItemId === menuItemId);
    if (index > -1) {
      items[index].quantity += quantity;
    } else {
      items.push({ menuItemId, quantity });
    }
    await cartRef.set({ items }, { merge: true });
    res.json({ items });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
