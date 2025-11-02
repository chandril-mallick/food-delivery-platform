// hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import OrderService from '../services/orderService';

// Custom hook for managing user orders
export const useUserOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time user orders updates
    const unsubscribe = OrderService.subscribeToUserOrderUpdates(userId, (updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userOrders = await OrderService.getOrderHistory(userId);
      setOrders(userOrders);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    orders,
    loading,
    error,
    refetch
  };
};

// Custom hook for managing single order tracking
export const useOrderTracking = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

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

  const cancelOrder = useCallback(async () => {
    if (!orderId) return;
    
    try {
      await OrderService.cancelOrder(orderId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [orderId]);

  const refetch = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const orderDetails = await OrderService.getOrderDetails(orderId);
      setOrder(orderDetails);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return {
    order,
    loading,
    error,
    cancelOrder,
    refetch
  };
};

// Custom hook for order placement
export const useOrderPlacement = () => {
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = useCallback(async (orderData) => {
    setPlacing(true);
    setError(null);
    
    try {
      const result = await OrderService.placeOrder(orderData);
      return { success: true, order: result };
    } catch (err) {
      const errorMessage = err.message || 'Failed to place order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setPlacing(false);
    }
  }, []);

  return {
    placeOrder,
    placing,
    error
  };
};

// Custom hook for admin order management
export const useAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  const fetchOrders = useCallback(async (filter = 'all') => {
    setLoading(true);
    try {
      let fetchedOrders;
      if (filter === 'all') {
        const { getAllOrders } = await import('../firebase/firestore');
        fetchedOrders = await getAllOrders(100);
      } else {
        const { getOrdersByStatus } = await import('../firebase/firestore');
        fetchedOrders = await getOrdersByStatus(filter);
      }
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await OrderService.updateStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  }, []);

  return {
    orders,
    loading,
    error,
    updating,
    fetchOrders,
    updateOrderStatus
  };
};

const orderHooks = {
  useUserOrders,
  useOrderTracking,
  useOrderPlacement,
  useAdminOrders
};

export default orderHooks;
