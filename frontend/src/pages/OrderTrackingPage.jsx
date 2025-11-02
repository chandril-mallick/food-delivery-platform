// pages/OrderTrackingPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderTracking from '../components/OrderTracking';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { user, provider } = useAuth();
  
  // Resolve user ID based on auth provider
  const userId = provider === 'supabase' ? user?.id : user?.uid;

  return (
    <div className="min-h-screen text-gray-100 relative bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <OrderTracking orderId={orderId} userId={userId} />
    </div>
  );
};

export default OrderTrackingPage;
