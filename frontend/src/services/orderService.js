// services/orderService.js
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus,
  subscribeToOrder,
  subscribeToUserOrders
} from '../firebase/firestore';
import adminNotificationService from './adminNotificationService';
import ErrorHandler from '../utils/errorHandler';

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment method constants
export const PAYMENT_METHODS = {
  COD: 'cash_on_delivery',
  ONLINE: 'online',
  WALLET: 'wallet'
};

// Order service class
class OrderService {
  // Place a new order
  static async placeOrder(orderData) {
    try {
      const {
        userId,
        items,
        deliveryAddress,
        paymentMethod = PAYMENT_METHODS.COD,
        specialInstructions = '',
        contactNumber
      } = orderData;

      // Calculate totals
      const subtotal = items.reduce((total, item) => total + (item.price * item.qty), 0);
      const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above ₹500
      const taxes = Math.round(subtotal * 0.05); // 5% tax
      const total = subtotal + deliveryFee + taxes;

      // Prepare order object
      const order = {
        userId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image || '',
          category: item.category || ''
        })),
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode,
          landmark: deliveryAddress.landmark || ''
        },
        contactNumber,
        paymentMethod,
        specialInstructions,
        pricing: {
          subtotal,
          deliveryFee,
          taxes,
          total
        },
        status: ORDER_STATUS.PENDING,
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        orderNumber: `ORD-${Date.now()}`
      };

      const orderId = await createOrder(order);
      
      // Trigger admin notification for new order
      const orderWithId = { id: orderId, ...order };
      try {
        // Send immediate notification to all active admin sessions
        adminNotificationService.notifyAdminsOfNewOrder(orderWithId);
      } catch (notificationError) {
        console.error('Failed to send admin notification:', notificationError);
        // Don't fail the order if notification fails
      }
      
      // Return order with ID
      return {
        id: orderId,
        ...order,
        success: true,
        message: 'Order placed successfully!'
      };
    } catch (error) {
      ErrorHandler.handleOrderError(error);
      throw new Error('Failed to place order. Please try again.');
    }
  }

  // Get user's order history
  static async getOrderHistory(userId) {
    try {
      const orders = await getUserOrders(userId);
      return orders;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw new Error('Failed to fetch order history.');
    }
  }

  // Get specific order details
  static async getOrderDetails(orderId) {
    try {
      const order = await getOrderById(orderId);
      return order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error('Failed to fetch order details.');
    }
  }

  // Update order status (for admin/restaurant)
  static async updateStatus(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      return { success: true, message: 'Order status updated successfully!' };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status.');
    }
  }

  // Cancel order (only if status is pending or confirmed)
  static async cancelOrder(orderId) {
    try {
      const order = await getOrderById(orderId);
      
      if (order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED) {
        await updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
        return { success: true, message: 'Order cancelled successfully!' };
      } else {
        throw new Error('Order cannot be cancelled at this stage.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Subscribe to real-time order updates
  static subscribeToOrderUpdates(orderId, callback) {
    return subscribeToOrder(orderId, callback);
  }

  // Subscribe to user's orders real-time updates
  static subscribeToUserOrderUpdates(userId, callback) {
    console.log('OrderService: Setting up subscription for userId:', userId);
    return subscribeToUserOrders(userId, (orders) => {
      console.log('OrderService: Firebase returned orders:', orders.length, 'orders');
      console.log('OrderService: Orders details:', orders);
      callback(orders);
    });
  }

  // Get order status display text
  static getStatusDisplayText(status) {
    const statusMap = {
      [ORDER_STATUS.PENDING]: 'Order Placed',
      [ORDER_STATUS.CONFIRMED]: 'Order Confirmed',
      [ORDER_STATUS.PREPARING]: 'Preparing Your Food',
      [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
      [ORDER_STATUS.DELIVERED]: 'Delivered',
      [ORDER_STATUS.CANCELLED]: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  // Get order status color for UI
  static getStatusColor(status) {
    const colorMap = {
      [ORDER_STATUS.PENDING]: 'text-yellow-600 bg-yellow-100',
      [ORDER_STATUS.CONFIRMED]: 'text-blue-600 bg-blue-100',
      [ORDER_STATUS.PREPARING]: 'text-orange-600 bg-orange-100',
      [ORDER_STATUS.OUT_FOR_DELIVERY]: 'text-purple-600 bg-purple-100',
      [ORDER_STATUS.DELIVERED]: 'text-green-600 bg-green-100',
      [ORDER_STATUS.CANCELLED]: 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }

  // Calculate estimated delivery time
  static calculateDeliveryTime(orderTime, status) {
    const baseTime = 30; // 30 minutes base delivery time
    const statusMultiplier = {
      [ORDER_STATUS.PENDING]: 1,
      [ORDER_STATUS.CONFIRMED]: 0.9,
      [ORDER_STATUS.PREPARING]: 0.7,
      [ORDER_STATUS.OUT_FOR_DELIVERY]: 0.3,
      [ORDER_STATUS.DELIVERED]: 0,
      [ORDER_STATUS.CANCELLED]: 0
    };

    if (status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.CANCELLED) {
      return null;
    }

    const remainingTime = Math.ceil(baseTime * (statusMultiplier[status] || 1));
    const estimatedTime = new Date(orderTime.getTime() + remainingTime * 60 * 1000);
    
    return estimatedTime;
  }

  // Validate delivery address
  static validateDeliveryAddress(address) {
    const required = ['street', 'city', 'state', 'pincode'];
    const missing = required.filter(field => !address[field] || address[field].trim() === '');
    
    if (missing.length > 0) {
      throw new Error(`Missing required address fields: ${missing.join(', ')}`);
    }

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(address.pincode)) {
      throw new Error('Pincode must be 6 digits');
    }

    return true;
  }

  // Format order for display
  static formatOrderForDisplay(order) {
    return {
      ...order,
      formattedTotal: `₹${order.pricing?.total || 0}`,
      formattedDate: order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '',
      formattedTime: order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : '',
      statusText: this.getStatusDisplayText(order.status),
      statusColor: this.getStatusColor(order.status),
      canCancel: order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED
    };
  }
}

export default OrderService;
