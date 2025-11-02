// utils/orderSeeder.js
import { addDocument } from '../firebase/firestore';
import { ORDER_STATUS } from '../services/orderService';

// Sample order data for testing
const sampleOrders = [
  {
    userId: 'demo-user-123',
    items: [
      {
        id: 'item-1',
        name: 'Butter Chicken',
        price: 280,
        qty: 2,
        image: '/images/butter-chicken.jpg',
        category: 'Main Course'
      },
      {
        id: 'item-2',
        name: 'Garlic Naan',
        price: 60,
        qty: 3,
        image: '/images/garlic-naan.jpg',
        category: 'Bread'
      }
    ],
    deliveryAddress: {
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      landmark: 'Near Metro Station'
    },
    contactNumber: '9876543210',
    paymentMethod: 'cash_on_delivery',
    specialInstructions: 'Please ring the bell twice',
    pricing: {
      subtotal: 740,
      deliveryFee: 0,
      taxes: 37,
      total: 777
    },
    status: ORDER_STATUS.DELIVERED,
    orderNumber: `ORD-${Date.now() - 86400000}` // Yesterday
  },
  {
    userId: 'demo-user-123',
    items: [
      {
        id: 'item-3',
        name: 'Chicken Biryani',
        price: 320,
        qty: 1,
        image: '/images/chicken-biryani.jpg',
        category: 'Rice'
      },
      {
        id: 'item-4',
        name: 'Raita',
        price: 80,
        qty: 1,
        image: '/images/raita.jpg',
        category: 'Sides'
      }
    ],
    deliveryAddress: {
      street: '456 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      landmark: 'Opposite City Mall'
    },
    contactNumber: '9876543210',
    paymentMethod: 'cash_on_delivery',
    specialInstructions: 'Extra spicy please',
    pricing: {
      subtotal: 400,
      deliveryFee: 50,
      taxes: 20,
      total: 470
    },
    status: ORDER_STATUS.OUT_FOR_DELIVERY,
    orderNumber: `ORD-${Date.now() - 3600000}` // 1 hour ago
  },
  {
    userId: 'demo-user-123',
    items: [
      {
        id: 'item-5',
        name: 'Paneer Tikka',
        price: 240,
        qty: 1,
        image: '/images/paneer-tikka.jpg',
        category: 'Appetizer'
      },
      {
        id: 'item-6',
        name: 'Dal Makhani',
        price: 180,
        qty: 1,
        image: '/images/dal-makhani.jpg',
        category: 'Main Course'
      },
      {
        id: 'item-7',
        name: 'Jeera Rice',
        price: 120,
        qty: 1,
        image: '/images/jeera-rice.jpg',
        category: 'Rice'
      }
    ],
    deliveryAddress: {
      street: '789 Brigade Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400003',
      landmark: 'Near Coffee Shop'
    },
    contactNumber: '9876543210',
    paymentMethod: 'cash_on_delivery',
    specialInstructions: '',
    pricing: {
      subtotal: 540,
      deliveryFee: 0,
      taxes: 27,
      total: 567
    },
    status: ORDER_STATUS.PREPARING,
    orderNumber: `ORD-${Date.now() - 1800000}` // 30 minutes ago
  },
  {
    userId: 'demo-user-123',
    items: [
      {
        id: 'item-8',
        name: 'Masala Dosa',
        price: 150,
        qty: 2,
        image: '/images/masala-dosa.jpg',
        category: 'South Indian'
      },
      {
        id: 'item-9',
        name: 'Filter Coffee',
        price: 40,
        qty: 2,
        image: '/images/filter-coffee.jpg',
        category: 'Beverages'
      }
    ],
    deliveryAddress: {
      street: '321 Commercial Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400004',
      landmark: 'Above Bank'
    },
    contactNumber: '9876543210',
    paymentMethod: 'cash_on_delivery',
    specialInstructions: 'Please deliver to office reception',
    pricing: {
      subtotal: 380,
      deliveryFee: 50,
      taxes: 19,
      total: 449
    },
    status: ORDER_STATUS.PENDING,
    orderNumber: `ORD-${Date.now() - 600000}` // 10 minutes ago
  }
];

// Function to seed sample orders
export const seedSampleOrders = async () => {
  try {
    console.log('🌱 Seeding sample orders...');
    
    for (const orderData of sampleOrders) {
      // Add timestamp
      const orderWithTimestamp = {
        ...orderData,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last 7 days
        updatedAt: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
      };
      
      const orderId = await addDocument('orders', orderWithTimestamp);
      console.log(`✅ Created order: ${orderData.orderNumber} (${orderId})`);
    }
    
    console.log('🎉 Sample orders seeded successfully!');
    return { success: true, message: 'Sample orders created successfully!' };
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    return { success: false, error: error.message };
  }
};

// Function to seed menu items if they don't exist
export const seedMenuItems = async () => {
  const menuItems = [
    {
      id: 'item-1',
      name: 'Butter Chicken',
      price: 280,
      description: 'Creamy tomato-based curry with tender chicken pieces',
      image: '/images/butter-chicken.jpg',
      category: 'Main Course',
      isVeg: false,
      rating: 4.5,
      prepTime: 25
    },
    {
      id: 'item-2',
      name: 'Garlic Naan',
      price: 60,
      description: 'Soft bread topped with garlic and herbs',
      image: '/images/garlic-naan.jpg',
      category: 'Bread',
      isVeg: true,
      rating: 4.3,
      prepTime: 10
    },
    {
      id: 'item-3',
      name: 'Chicken Biryani',
      price: 320,
      description: 'Aromatic basmati rice with spiced chicken',
      image: '/images/chicken-biryani.jpg',
      category: 'Rice',
      isVeg: false,
      rating: 4.7,
      prepTime: 35
    },
    {
      id: 'item-4',
      name: 'Raita',
      price: 80,
      description: 'Cool yogurt with cucumber and mint',
      image: '/images/raita.jpg',
      category: 'Sides',
      isVeg: true,
      rating: 4.2,
      prepTime: 5
    },
    {
      id: 'item-5',
      name: 'Paneer Tikka',
      price: 240,
      description: 'Grilled cottage cheese with spices',
      image: '/images/paneer-tikka.jpg',
      category: 'Appetizer',
      isVeg: true,
      rating: 4.4,
      prepTime: 20
    }
  ];

  try {
    console.log('🌱 Seeding menu items...');
    
    for (const item of menuItems) {
      const itemId = await addDocument('menuItems', item);
      console.log(`✅ Created menu item: ${item.name} (${itemId})`);
    }
    
    console.log('🎉 Menu items seeded successfully!');
    return { success: true, message: 'Menu items created successfully!' };
  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    return { success: false, error: error.message };
  }
};

// Combined seeder function
export const seedAllData = async () => {
  try {
    const menuResult = await seedMenuItems();
    const orderResult = await seedSampleOrders();
    
    return {
      success: menuResult.success && orderResult.success,
      message: 'All sample data seeded successfully!',
      details: { menuResult, orderResult }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const orderSeederUtils = {
  seedSampleOrders,
  seedMenuItems,
  seedAllData
};

export default orderSeederUtils;
