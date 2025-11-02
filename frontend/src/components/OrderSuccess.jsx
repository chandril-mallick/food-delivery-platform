// components/OrderSuccess.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OrderSuccess = ({ order: propOrder }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  
  // Get order from props or location state
  const order = propOrder || location.state?.order;
  const autoRedirect = location.state?.autoRedirect;
  
  // Auto-redirect countdown effect
  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && countdown === 0) {
      navigate('/orders');
    }
  }, [countdown, autoRedirect, navigate]);
  
  if (!order) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">Thank you for your order. We're preparing your delicious meal!</p>
        
        {/* Auto-redirect countdown */}
        {autoRedirect && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600 font-medium">
                🚀 Redirecting to your orders in {countdown} seconds...
              </span>
            </div>
            <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-semibold text-gray-800">{order.orderNumber}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Order Time:</span>
            <span className="text-gray-800">{formatTime(order.createdAt)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold text-orange-600">₹{order.pricing?.total}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="text-gray-800">
              {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Delivery:</span>
            <span className="text-gray-800">30-45 minutes</span>
          </div>
        </div>

        <hr className="my-4" />

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Items Ordered</h3>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.qty}</span>
                <span className="text-gray-800">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-4" />

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Delivery Address</h3>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress?.street}<br />
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state}<br />
            {order.deliveryAddress?.pincode}
          </p>
        </div>
      </div>

      {/* Delivery Timer Info */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">⏰</span>
          <h3 className="font-semibold text-green-800">Estimated Delivery</h3>
        </div>
        <p className="text-green-600 text-center">
          Your order will be delivered within <strong>30 minutes</strong>
        </p>
        <p className="text-green-600 text-center text-sm mt-1">
          Estimated delivery time: {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime.seconds ? order.estimatedDeliveryTime.seconds * 1000 : order.estimatedDeliveryTime).toLocaleTimeString() : 'Calculating...'}
        </p>
        <div className="mt-3 bg-white p-2 rounded-md border border-green-100">
          <div className="text-sm text-center text-gray-600">
            <p>Thank you for your order! You can track your order status below.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/order-tracking/${order.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <span className="mr-2">📍</span>
          Track Your Order
        </Link>
        
        <Link
          to="/order-history"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <span className="mr-2">📋</span>
          View All Orders
        </Link>
        
        <Link
          to="/menu"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <span className="mr-2">🍽️</span>
          Order More Food
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">📱</span>
          <h3 className="font-semibold text-blue-800">Stay Updated</h3>
        </div>
        <p className="text-blue-600 text-sm">
          You'll receive real-time updates about your order status. 
          You can also track your order anytime using the tracking link above.
        </p>
      </div>

      {/* Contact Info */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Need help? Contact us at{' '}
          <a href="tel:+919876543210" className="text-orange-500 hover:text-orange-600">
            +91 98765 43210
          </a>
          {' '}or{' '}
          <a href="mailto:support@dabba.com" className="text-orange-500 hover:text-orange-600">
            support@dabba.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
