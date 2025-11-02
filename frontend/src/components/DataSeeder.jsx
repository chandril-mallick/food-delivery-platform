// components/DataSeeder.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { seedAllData, seedSampleOrders, seedMenuItems } from '../utils/orderSeeder';

const DataSeeder = () => {
  const [loading, setLoading] = useState({
    all: false,
    orders: false,
    menu: false
  });

  const handleSeedAll = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    try {
      const result = await seedAllData();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to seed data');
      }
    } catch (error) {
      toast.error('Error seeding data: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const handleSeedOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const result = await seedSampleOrders();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to seed orders');
      }
    } catch (error) {
      toast.error('Error seeding orders: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const handleSeedMenu = async () => {
    setLoading(prev => ({ ...prev, menu: true }));
    try {
      const result = await seedMenuItems();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to seed menu items');
      }
    } catch (error) {
      toast.error('Error seeding menu items: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, menu: false }));
    }
  };



  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Database Seeder</h2>
        <p className="text-gray-600 mb-6">
          Use these buttons to populate your Firestore database with sample data for testing the order system.
        </p>

        <div className="space-y-4">
          {/* Seed All Data */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Seed All Data</h3>
            <p className="text-gray-600 text-sm mb-3">
              Creates sample menu items and orders for testing the complete system.
            </p>
            <button
              onClick={handleSeedAll}
              disabled={loading.all}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              {loading.all ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Seeding...
                </>
              ) : (
                'Seed All Data'
              )}
            </button>
          </div>

          {/* Seed Orders Only */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Seed Sample Orders</h3>
            <p className="text-gray-600 text-sm mb-3">
              Creates sample orders with different statuses for testing order tracking and history.
            </p>
            <button
              onClick={handleSeedOrders}
              disabled={loading.orders}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              {loading.orders ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Seeding...
                </>
              ) : (
                'Seed Orders Only'
              )}
            </button>
          </div>

          {/* Seed Menu Items Only */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Seed Menu Items</h3>
            <p className="text-gray-600 text-sm mb-3">
              Creates sample menu items for testing the menu and ordering system.
            </p>
            <button
              onClick={handleSeedMenu}
              disabled={loading.menu}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              {loading.menu ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Seeding...
                </>
              ) : (
                'Seed Menu Items Only'
              )}
            </button>
          </div>


        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Make sure your Firebase configuration is set up correctly</li>
            <li>• This will create real data in your Firestore database</li>
            <li>• Sample orders are created for user ID: 'demo-user-123'</li>
            <li>• You can delete the seeded data from Firebase console if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataSeeder;
