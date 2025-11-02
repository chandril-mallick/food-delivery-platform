// Run this script to seed your Firestore database with menu items
// Usage: node src/seedDatabase.js

import { seedMenuItems } from './firebase/seedData.js';

const runSeed = async () => {
  console.log('🌱 Starting database seeding...');
  try {
    await seedMenuItems();
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();
