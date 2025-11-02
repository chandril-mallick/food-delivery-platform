// components/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrderService, { ORDER_STATUS } from '../services/orderService';
import { toast } from 'react-hot-toast';
import { Clock, CheckCircle, Truck, ChefHat, Package, XCircle, MapPin, Phone } from 'lucide-react';

const OrderHistory = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!userId) {
      console.log('OrderHistory: No userId provided');
      setLoading(false);
      setOrders([]);
      return;
    }

    console.log('OrderHistory: Setting up subscription for userId:', userId);
    setLoading(true);
    
    // Subscribe to real-time user orders updates
    let unsubscribe;
    try {
      unsubscribe = OrderService.subscribeToUserOrderUpdates(userId, (updatedOrders) => {
        console.log('OrderHistory: Received orders update:', updatedOrders.length, 'orders');
        console.log('OrderHistory: Orders data:', updatedOrders);
        setOrders(updatedOrders);
        setLoading(false);
        setError(null);
      });
    } catch (error) {
      console.error('OrderHistory: Error setting up subscription:', error);
      setError('Failed to load orders. Please check your connection and try again.');
      setLoading(false);
    }

    // Cleanup subscription on unmount
    return () => {
      console.log('OrderHistory: Cleaning up subscription');
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const handleReorder = async (order) => {
    try {
      // This would typically add items back to cart
      // For now, we'll just show a toast
      toast.success('Items added to cart! Redirecting to checkout...');
      // You can implement the actual reorder logic here
    } catch (error) {
      toast.error('Failed to reorder items');
    }
  };


  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return OrderService.getStatusColor(status);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return <Clock className="w-5 h-5" />;
      case ORDER_STATUS.CONFIRMED:
        return <CheckCircle className="w-5 h-5" />;
      case ORDER_STATUS.PREPARING:
        return <ChefHat className="w-5 h-5" />;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return <Truck className="w-5 h-5" />;
      case ORDER_STATUS.DELIVERED:
        return <Package className="w-5 h-5" />;
      case ORDER_STATUS.CANCELLED:
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Get progress percentage
  const getProgressPercentage = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 20;
      case ORDER_STATUS.CONFIRMED:
        return 40;
      case ORDER_STATUS.PREPARING:
        return 60;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return 80;
      case ORDER_STATUS.DELIVERED:
        return 100;
      case ORDER_STATUS.CANCELLED:
        return 0;
      default:
        return 0;
    }
  };

  // Get estimated delivery time
  const getEstimatedDeliveryTime = (order) => {
    if (order.status === ORDER_STATUS.DELIVERED) {
      return 'Delivered';
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      return 'Cancelled';
    }
    
    const orderTime = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(order.createdAt);
    const estimatedTime = new Date(orderTime.getTime() + 30 * 60 * 1000); // 30 minutes
    const now = new Date();
    
    if (estimatedTime <= now) {
      return 'Should arrive soon';
    }
    
    const timeLeft = Math.ceil((estimatedTime - now) / (1000 * 60));
    return `${timeLeft} min remaining`;
  };

  // Separate orders into active and completed
  const activeOrders = orders.filter(order => 
    order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED
  );
  
  const completedOrders = orders.filter(order => 
    order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED
  );

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED;
    if (filter === 'completed') return order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED;
    return order.status === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'active', label: 'Active Orders', count: activeOrders.length },
    { value: 'completed', label: 'Completed', count: completedOrders.length },
    { value: ORDER_STATUS.PENDING, label: 'Pending', count: orders.filter(o => o.status === ORDER_STATUS.PENDING).length },
    { value: ORDER_STATUS.CONFIRMED, label: 'Confirmed', count: orders.filter(o => o.status === ORDER_STATUS.CONFIRMED).length },
    { value: ORDER_STATUS.PREPARING, label: 'Preparing', count: orders.filter(o => o.status === ORDER_STATUS.PREPARING).length },
    { value: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', count: orders.filter(o => o.status === ORDER_STATUS.OUT_FOR_DELIVERY).length },
    { value: ORDER_STATUS.DELIVERED, label: 'Delivered', count: orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length },
    { value: ORDER_STATUS.CANCELLED, label: 'Cancelled', count: orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length }
  ];

  // Render a single order card
  const renderOrderCard = (order) => (
    <div key={order.id} className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-md border border-white/10 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Order Header */}
      <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <div className={`p-2 rounded-full ${getStatusColor(order.status)} flex items-center justify-center`}>
              {getStatusIcon(order.status)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-300">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-300">
              ₹{order.pricing?.total}
            </div>
            <div className="text-sm text-gray-300">
              {getEstimatedDeliveryTime(order)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {order.status !== ORDER_STATUS.CANCELLED && (
        <div className="px-6 py-3 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Order Progress</span>
            <span className="text-sm text-gray-400">{getProgressPercentage(order.status)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage(order.status)}%` }}
            ></div>
          </div>
          
          {/* Status Steps */}
          <div className="flex justify-between mt-3 text-xs">
            <span className={order.status === ORDER_STATUS.PENDING ? 'text-orange-300 font-medium' : 'text-gray-400'}>Pending</span>
            <span className={order.status === ORDER_STATUS.CONFIRMED ? 'text-orange-300 font-medium' : 'text-gray-400'}>Confirmed</span>
            <span className={order.status === ORDER_STATUS.PREPARING ? 'text-orange-300 font-medium' : 'text-gray-400'}>Preparing</span>
            <span className={order.status === ORDER_STATUS.OUT_FOR_DELIVERY ? 'text-orange-300 font-medium' : 'text-gray-400'}>Out for Delivery</span>
            <span className={order.status === ORDER_STATUS.DELIVERED ? 'text-green-300 font-medium' : 'text-gray-400'}>Delivered</span>
          </div>
        </div>
      )}

      {/* Order Content */}
      <div className="p-6">
        {/* Items Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Items Ordered</h4>
          <div className="flex flex-wrap gap-2">
            {order.items?.slice(0, 3).map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1 text-sm text-gray-200 bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                {item.name} × {item.qty}
              </span>
            ))}
            {order.items?.length > 3 && (
              <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                +{order.items.length - 3} more items
              </span>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">Delivery Address</h4>
                <p className="text-sm text-blue-300">
                  {order.deliveryAddress.street}<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                  {order.deliveryAddress.landmark && (
                    <><br /><span className="text-blue-300">📍 {order.deliveryAddress.landmark}</span></>
                  )}
                </p>
                {order.contactNumber && (
                  <div className="flex items-center gap-1 mt-2">
                    <Phone className="w-3 h-3 text-blue-300" />
                    <span className="text-sm text-blue-300">{order.contactNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 lg:ml-6">
          <Link
            to={`/order-tracking/${order.id}`}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Truck className="w-4 h-4" />
            Track Order
          </Link>
          
          {order.status === ORDER_STATUS.DELIVERED && (
            <button
              onClick={() => handleReorder(order)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Package className="w-4 h-4" />
              Reorder
            </button>
          )}
          
         
          
          {/* Live Status Indicator */}
          {order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED && (
            <div className="flex items-center gap-2 bg-orange-500/10 text-orange-300 px-3 py-2 rounded-lg border border-orange-500/20">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Tracking</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Items (Expandable) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-300 hover:text-white">
          View order details
        </summary>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Items */}
            <div>
              <h4 className="font-medium text-white mb-2">Items Ordered</h4>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.name} × {item.qty}</span>
                    <span className="text-white">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h4 className="font-medium text-white mb-2">Delivery Address</h4>
              <p className="text-sm text-gray-300">
                {order.deliveryAddress?.street}<br />
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state}<br />
                {order.deliveryAddress?.pincode}
              </p>
              
              {order.specialInstructions && (
                <div className="mt-2">
                  <h4 className="font-medium text-white text-sm">Special Instructions</h4>
                  <p className="text-sm text-gray-300">{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                <div className="flex justify-between w-48">
                  <span className="text-gray-300">Subtotal:</span>
                  <span className="text-white">₹{order.pricing?.subtotal}</span>
                </div>
                <div className="flex justify-between w-48">
                  <span className="text-gray-300">Delivery Fee:</span>
                  <span className="text-white">
                    {order.pricing?.deliveryFee === 0 ? 'Free' : `₹${order.pricing?.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between w-48">
                  <span className="text-gray-300">Taxes:</span>
                  <span className="text-white">₹{order.pricing?.taxes}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-orange-300">
                  Total: ₹{order.pricing?.total}
                </div>
                <div className="text-sm text-gray-300">
                  {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod}
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-gray-100 relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-gray-100 relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Orders</h2>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100 relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
            <p className="text-gray-300">Track your orders with real-time updates</p>
          </div>
        </div>
        
        {/* Live Orders Summary */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-medium text-blue-300">Active Orders</span>
              </div>
              <div className="text-2xl font-bold text-blue-300 mt-1">
                {orders.filter(o => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.CANCELLED).length}
              </div>
            </div>
            
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm font-medium text-green-300">Delivered</span>
              </div>
              <div className="text-2xl font-bold text-green-300 mt-1">
                {orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length}
              </div>
            </div>
            
            <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-300" />
                <span className="text-sm font-medium text-orange-300">Total Orders</span>
              </div>
              <div className="text-2xl font-bold text-orange-300 mt-1">
                {orders.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-white/10">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  filter === option.value
                    ? 'border-orange-500 text-orange-300'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className="ml-2 bg-white/5 text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

{/* Orders List */}
      {filter === 'all' ? (
        <>
          {/* Active Orders Section */}
          <div>
            <h2 className="text-xl font-bold text-blue-300 mb-4">Active Orders</h2>
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No active orders</div>
            ) : (
              <div className="space-y-6 mb-10">
                {activeOrders.map(renderOrderCard)}
              </div>
            )}
          </div>

          {/* Completed Orders Section */}
          <div>
            <h2 className="text-xl font-bold text-green-300 mb-4">Completed Orders</h2>
            {completedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No completed orders</div>
            ) : (
              <div className="space-y-6">
                {completedOrders.map(renderOrderCard)}
              </div>
            )}
          </div>
        </>
      ) : (
        filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {`No ${filterOptions.find(o => o.value === filter)?.label.toLowerCase()} orders`}
            </h3>
            <p className="text-gray-300 mb-6">
              {`You don't have any ${filterOptions.find(o => o.value === filter)?.label.toLowerCase()} orders.`}
            </p>
            <Link
              to="/menu"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(renderOrderCard)}
          </div>
        )
      )}
    </div>
  );
};

export default OrderHistory;
