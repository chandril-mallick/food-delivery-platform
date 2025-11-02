const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Place order
router.post('/:userId', async (req, res) => {
  try {
    const cartRef = admin.firestore().collection('carts').doc(req.params.userId);
    const cartSnapshot = await cartRef.get();
    if (!cartSnapshot.exists || (cartSnapshot.data().items || []).length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }
    const cart = cartSnapshot.data();
    const menuCollection = admin.firestore().collection('menu');
    let total = 0;
    // Enrich items with price
    const detailedItems = await Promise.all(
      cart.items.map(async i => {
        const menuDoc = await menuCollection.doc(i.menuItemId).get();
        const price = menuDoc.data().price;
        total += price * i.quantity;
        return { ...i, price };
      })
    );
    // Create order
    const orderRef = await admin.firestore().collection('orders').add({
      userId: req.params.userId,
      items: detailedItems,
      total,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Clear cart
    await cartRef.set({ items: [] });

    const orderDoc = await orderRef.get();
    res.json({ id: orderDoc.id, ...orderDoc.data() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get orders for user
router.get('/:userId', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('orders').where('userId', '==', req.params.userId).get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
