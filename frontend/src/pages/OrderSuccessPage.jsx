// pages/OrderSuccessPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import OrderSuccess from '../components/OrderSuccess';

const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="min-h-screen text-gray-100 relative bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <OrderSuccess order={order} />
    </div>
  );
};

export default OrderSuccessPage;
