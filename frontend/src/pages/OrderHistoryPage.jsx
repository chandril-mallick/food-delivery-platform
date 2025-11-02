// pages/OrderHistoryPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import OrderHistory from '../components/OrderHistory';

const OrderHistoryPage = () => {
  const { user, provider } = useAuth();
  
  // Resolve user ID based on auth provider
  const userId = provider === 'supabase' ? user?.id : user?.uid;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <OrderHistory userId={userId} />
    </div>
  );
};

export default OrderHistoryPage;
