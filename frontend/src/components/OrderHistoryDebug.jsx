// components/OrderHistoryDebug.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../firebase/firestore';
import { toast } from 'react-hot-toast';

const OrderHistoryDebug = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createTestOrder = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    try {
      const testOrder = {
        userId: user.uid,
        orderNumber: `ORD${Date.now()}`,
        items: [
          {
            id: 'test-1',
            name: 'Test Dal Chawal',
            price: 149,
            qty: 2,
            image: 'https://via.placeholder.com/150'
          },
          {
            id: 'test-2', 
            name: 'Test Roti Sabzi',
            price: 179,
            qty: 1,
            image: 'https://via.placeholder.com/150'
          }
        ],
        deliveryAddress: {
          street: 'Test Street, Test Area',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          landmark: 'Near Test Landmark'
        },
        contactNumber: '9876543210',
        paymentMethod: 'cash_on_delivery',
        specialInstructions: 'Test order for debugging',
        status: 'pending',
        pricing: {
          subtotal: 477,
          deliveryFee: 0,
          taxes: 24,
          total: 501
        },
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const orderId = await createOrder(testOrder);
      toast.success(`Test order created with ID: ${orderId}`);
    } catch (error) {
      console.error('Error creating test order:', error);
      toast.error('Failed to create test order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Order History Debug</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800">Authentication Status:</h3>
            <p className="text-sm text-gray-600">
              {user ? (
                <>
                  ✅ Logged in as: {user.email} (UID: {user.uid})
                </>
              ) : (
                <>
                  ❌ Not logged in
                </>
              )}
            </p>
          </div>

          {user && (
            <div>
              <button
                onClick={createTestOrder}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Test Order'}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                This will create a test order to check if the order history page works.
              </p>
            </div>
          )}

          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 text-sm">
                Please login first to test order creation and view order history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryDebug;
