// components/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import OrderService, { ORDER_STATUS } from '../services/orderService';

const OrderTracking = ({ orderId, userId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!orderId) return;

    // Subscribe to real-time order updates
    const unsubscribe = OrderService.subscribeToOrderUpdates(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  // Update current time every minute for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getStatusSteps = () => {
    const steps = [
      { status: ORDER_STATUS.PENDING, label: 'Order Placed', icon: '📋' },
      { status: ORDER_STATUS.CONFIRMED, label: 'Order Confirmed', icon: '✅' },
      { status: ORDER_STATUS.PREPARING, label: 'Preparing Food', icon: '👨‍🍳' },
      { status: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: '🚚' },
      { status: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: '🎉' }
    ];

    if (order?.status === ORDER_STATUS.CANCELLED) {
      return [
        { status: ORDER_STATUS.PENDING, label: 'Order Placed', icon: '📋' },
        { status: ORDER_STATUS.CANCELLED, label: 'Order Cancelled', icon: '❌' }
      ];
    }

    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.status === order?.status);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  const calculateRemainingTime = () => {
    if (!order || order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED) {
      return null;
    }

    const estimatedTime = OrderService.calculateDeliveryTime(
      order.createdAt ? new Date(order.createdAt.seconds * 1000) : new Date(),
      order.status
    );

    if (!estimatedTime) return null;

    const diff = estimatedTime.getTime() - currentTime.getTime();
    
    if (diff <= 0) return 'Any moment now!';

    const minutes = Math.ceil(diff / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Order Not Found</h2>
          <p className="text-red-600">
            {error || 'Unable to load order details. Please check your order ID.'}
          </p>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();
  const remainingTime = calculateRemainingTime();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
        <p className="text-gray-600">Order #{order.orderNumber}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Status</h2>
            
            {/* Status Timeline */}
            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isCancelled = order.status === ORDER_STATUS.CANCELLED && step.status === ORDER_STATUS.CANCELLED;
                
                return (
                  <div key={step.status} className="flex items-center">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                          isCompleted || isCancelled
                            ? isCancelled
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step.icon}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3
                        className={`text-lg font-medium ${
                          isCompleted || isCancelled
                            ? isCancelled
                              ? 'text-red-800'
                              : 'text-green-800'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </h3>
                      
                      {isCurrent && !isCancelled && (
                        <p className="text-sm text-blue-600 font-medium">
                          Current Status
                          {remainingTime && (
                            <span className="ml-2 text-gray-600">
                              • ETA: {remainingTime}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-6 mt-12 w-0.5 h-6 ${
                          index < currentStepIndex ? 'bg-green-300' : 'bg-gray-200'
                        }`}
                        style={{ marginLeft: '1.5rem' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estimated Delivery Time */}
            {remainingTime && order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⏰</span>
                  <div>
                    <h3 className="font-semibold text-blue-800">Estimated Delivery Time</h3>
                    <p className="text-blue-600">{remainingTime} remaining</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">₹{item.price} × {item.qty}</p>
                  </div>
                  <span className="font-medium text-gray-800">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{order.pricing?.subtotal}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-800">
                  {order.pricing?.deliveryFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `₹${order.pricing?.deliveryFee}`
                  )}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-800">₹{order.pricing?.taxes}</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-800">Total</span>
                <span className="text-orange-600">₹{order.pricing?.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Details</h2>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-700">Address</h4>
                <p className="text-gray-600">
                  {order.deliveryAddress?.street}<br />
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state}<br />
                  {order.deliveryAddress?.pincode}
                  {order.deliveryAddress?.landmark && (
                    <><br />Landmark: {order.deliveryAddress.landmark}</>
                  )}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Contact</h4>
                <p className="text-gray-600">{order.contactNumber}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Payment Method</h4>
                <p className="text-gray-600">
                  {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod}
                </p>
              </div>
              
              {order.specialInstructions && (
                <div>
                  <h4 className="font-medium text-gray-700">Special Instructions</h4>
                  <p className="text-gray-600">{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Information</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="text-gray-800 font-mono">{order.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number</span>
                <span className="text-gray-800">{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Time</span>
                <span className="text-gray-800">{formatTime(order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
