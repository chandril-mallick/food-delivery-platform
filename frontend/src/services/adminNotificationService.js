// services/adminNotificationService.js
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

class AdminNotificationService {
  constructor() {
    this.unsubscribe = null;
    this.lastOrderTime = Date.now();
    this.isListening = false;
  }

  // Start listening for new orders
  startListening(adminUserId) {
    if (this.isListening) return;

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const order = { id: change.doc.id, ...change.doc.data() };
            const orderTime = order.createdAt?.toDate?.()?.getTime() || new Date(order.createdAt).getTime();
            
            // Only notify for orders placed after we started listening
            if (orderTime > this.lastOrderTime) {
              this.showNewOrderNotification(order);
              this.playNotificationSound();
            }
          }
        });
      }, (error) => {
        console.error('Error listening to orders:', error);
        toast.error('Failed to connect to order notifications');
      });

      this.isListening = true;
      console.log('Admin notification service started');
      
    } catch (error) {
      console.error('Error starting notification service:', error);
      toast.error('Failed to start notification service');
    }
  }

  // Stop listening for new orders
  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.isListening = false;
      console.log('Admin notification service stopped');
    }
  }

  // Show new order notification
  showNewOrderNotification(order) {
    const orderValue = order.pricing?.total || 0;
    const customerName = order.deliveryAddress?.name || 'Unknown Customer';
    const orderNumber = order.orderNumber || order.id?.slice(-6);

    // Create custom notification toast
    toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                New Order Received!
              </p>
              <p className="mt-1 text-sm text-orange-100">
                Order #{orderNumber}
              </p>
              <p className="text-sm text-orange-100">
                {customerName}
              </p>
              <p className="text-sm font-semibold text-white">
                Amount: ₹{orderValue}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-orange-400">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-right',
    });

    // Show browser notification if permission granted
    this.showBrowserNotification(order);
  }

  // Show browser notification
  showBrowserNotification(order) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const orderValue = order.pricing?.total || 0;
      const customerName = order.deliveryAddress?.name || 'Unknown Customer';
      const orderNumber = order.orderNumber || order.id?.slice(-6);

      new Notification('New Order Received - Dabba App', {
        body: `Order #${orderNumber} from ${customerName} - ₹${orderValue}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `order-${order.id}`,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Order' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a simple notification beep
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Notify all active admin sessions of new order
  notifyAdminsOfNewOrder(order) {
    try {
      // Show notification immediately
      this.showNewOrderNotification(order);
      this.playNotificationSound();
      
      // Send browser notification
      this.showBrowserNotification(order);
      
      // Log for debugging
      console.log('Admin notification sent for order:', order.id);
      
      // You can extend this to send notifications to multiple admin sessions
      // or integrate with push notification services like FCM
      
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  }

  // Check if user is admin
  static isAdmin(user) {
    if (!user) return false;
    
    // Check if email contains 'admin' or specific admin UIDs
    const adminEmails = ['farhanroit2004@gmail.com', 'chandrilmallick@gmail.com'];
    const adminUIDs = ['admin-uid-1', 'admin-uid-2']; // Add specific admin UIDs
    
    return (
      user.email?.toLowerCase().includes('admin') ||
      adminEmails.includes(user.email?.toLowerCase()) ||
      adminUIDs.includes(user.uid)
    );
  }
}

// Create singleton instance
const adminNotificationService = new AdminNotificationService();

export default adminNotificationService;
