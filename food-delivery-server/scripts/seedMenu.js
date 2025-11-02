// scripts/seedMenu.js
// One-off script to seed sample menu items into Firestore.
// Usage: `node scripts/seedMenu.js`

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    // Re-use existing serviceAccountKey.json path relative to server root
    const serviceKeyPath = path.resolve(__dirname, '../serviceAccountKey.json');
    if (!fs.existsSync(serviceKeyPath)) {
      console.error('serviceAccountKey.json not found – aborting');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert(require(serviceKeyPath)),
    });

    const menuRef = admin.firestore().collection('menu');

    const sampleItems = [
      {
        name: 'Veg Thali',
        description: 'Rice, roti, sabzi, dal and salad',
        price: 99,
        image: 'https://source.unsplash.com/400x300/?indian-food',
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Creamy curry with soft paneer cubes',
        price: 149,
        image: 'https://source.unsplash.com/400x300/?paneer',
      },
      {
        name: 'Chicken Biryani',
        description: 'Spicy Hyderabadi biryani',
        price: 199,
        image: 'https://source.unsplash.com/400x300/?biryani',
      },
      {
        name: 'Gulab Jamun (2 pc)',
        description: 'Soft khoya balls in rose-scented syrup',
        price: 60,
        image: 'https://source.unsplash.com/400x300/?gulab-jamun',
      },
    ];

    // idempotent: only add if collection is empty
    const snap = await menuRef.limit(1).get();
    if (!snap.empty) {
      console.log('Menu collection already contains data – skipping seeding.');
      process.exit(0);
    }

    const batch = admin.firestore().batch();
    sampleItems.forEach((item) => {
      const doc = menuRef.doc();
      batch.set(doc, item);
    });
    await batch.commit();

    console.log('✅ Seeded sample menu items into Firestore');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
