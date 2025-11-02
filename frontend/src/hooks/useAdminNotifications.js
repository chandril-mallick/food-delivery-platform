// hooks/useAdminNotifications.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import adminNotificationService from '../services/adminNotificationService';
import { toast } from 'react-hot-toast';

export const useAdminNotifications = () => {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Check if user is admin
    const isAdmin = adminNotificationService.constructor.isAdmin(user);
    
    if (isAdmin && user) {
      // Request notification permission
      adminNotificationService.constructor.requestNotificationPermission()
        .then(granted => {
          setNotificationPermission(granted ? 'granted' : 'denied');
          if (granted) {
            toast.success('Browser notifications enabled for new orders');
          }
        });

      // Start listening for new orders
      adminNotificationService.startListening(user.uid);
      setIsListening(true);

      // Show welcome message
      toast.success('Admin notifications active - You\'ll be notified of new orders', {
        duration: 4000,
        icon: '🔔'
      });

      // Cleanup on unmount
      return () => {
        adminNotificationService.stopListening();
        setIsListening(false);
      };
    }
  }, [user]);

  const toggleNotifications = () => {
    if (isListening) {
      adminNotificationService.stopListening();
      setIsListening(false);
      toast.success('Admin notifications disabled');
    } else {
      adminNotificationService.startListening(user?.uid);
      setIsListening(true);
      toast.success('Admin notifications enabled');
    }
  };

  return {
    isListening,
    notificationPermission,
    toggleNotifications,
    isAdmin: adminNotificationService.constructor.isAdmin(user)
  };
};
