import React, { useState } from 'react';
import { createDocument } from '../firebase/firestore';

// Sample menu items data
const sampleMenuItems = [
  {
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces",
    price: 280,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
    category: "Main Course",
    isVegetarian: false,
    spiceLevel: "Medium",
    preparationTime: 25,
    ingredients: ["Chicken", "Tomato", "Cream", "Butter", "Spices"],
    available: true
  },
  {
    name: "Paneer Tikka Masala",
    description: "Grilled paneer cubes in rich tomato gravy",
    price: 240,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400",
    category: "Main Course",
    isVegetarian: true,
    spiceLevel: "Medium",
    preparationTime: 20,
    ingredients: ["Paneer", "Tomato", "Onion", "Cream", "Spices"],
    available: true
  },
  {
    name: "Biryani",
    description: "Fragrant basmati rice with aromatic spices and meat",
    price: 320,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400",
    category: "Rice",
    isVegetarian: false,
    spiceLevel: "Medium",
    preparationTime: 45,
    ingredients: ["Basmati Rice", "Chicken", "Saffron", "Yogurt", "Spices"],
    available: true
  },
  {
    name: "Dal Tadka",
    description: "Yellow lentils tempered with cumin and spices",
    price: 160,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
    category: "Dal",
    isVegetarian: true,
    spiceLevel: "Mild",
    preparationTime: 15,
    ingredients: ["Yellow Lentils", "Cumin", "Turmeric", "Onion", "Tomato"],
    available: true
  },
  {
    name: "Naan",
    description: "Soft and fluffy Indian bread baked in tandoor",
    price: 40,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    category: "Bread",
    isVegetarian: true,
    spiceLevel: "None",
    preparationTime: 10,
    ingredients: ["Flour", "Yogurt", "Yeast", "Salt"],
    available: true
  }
];

const SeedDatabase = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');
  const [seedComplete, setSeedComplete] = useState(false);

  const seedMenuItems = async () => {
    setIsSeeding(true);
    setSeedStatus('Starting to seed database...');
    
    try {
      for (let i = 0; i < sampleMenuItems.length; i++) {
        const item = sampleMenuItems[i];
        setSeedStatus(`Adding ${item.name}... (${i + 1}/${sampleMenuItems.length})`);
        
        const docId = await createDocument('menuItems', item);
        console.log(`✅ Added ${item.name} with ID: ${docId}`);
      }
      
      setSeedStatus('✅ Successfully seeded all menu items!');
      setSeedComplete(true);
      console.log('🎉 Database seeding completed!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      setSeedStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">Database Seeder</h2>
      
      <div className="text-center">
        {!seedComplete ? (
          <button
            onClick={seedMenuItems}
            disabled={isSeeding}
            className={`px-6 py-3 rounded-lg font-medium ${
              isSeeding 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isSeeding ? 'Seeding...' : 'Seed Menu Items'}
          </button>
        ) : (
          <div className="text-green-600 font-medium">
            Database seeded successfully! 🎉
            <br />
            <span className="text-sm text-gray-600">
              You can now navigate to the Menu page to see the items.
            </span>
          </div>
        )}
      </div>
      
      {seedStatus && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-center">
          {seedStatus}
        </div>
      )}
      
      {seedComplete && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          You can remove this component after seeding is complete.
        </div>
      )}
    </div>
  );
};

export default SeedDatabase;
