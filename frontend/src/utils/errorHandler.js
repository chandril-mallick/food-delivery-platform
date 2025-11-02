// Centralized error handling for production
import { toast } from 'react-hot-toast';

export class ErrorHandler {
  static logError(error, context = '') {
    console.error(`[${context}] Error:`, error);
    
    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { tags: { context } });
    }
  }

  static handleAuthError(error) {
    const message = this.getAuthErrorMessage(error);
    toast.error(message);
    this.logError(error, 'AUTH');
  }

  static handleFirestoreError(error) {
    const message = this.getFirestoreErrorMessage(error);
    toast.error(message);
    this.logError(error, 'FIRESTORE');
  }

  static handleOrderError(error) {
    const message = this.getOrderErrorMessage(error);
    toast.error(message);
    this.logError(error, 'ORDER');
  }

  static getAuthErrorMessage(error) {
    const code = error?.code || error?.message || '';
    
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'Please enter a valid phone number';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP. Please check and try again';
      case 'auth/code-expired':
        return 'OTP has expired. Please request a new one';
      case 'auth/admin-restricted-operation':
        return 'Authentication service temporarily unavailable';
      default:
        return 'Authentication failed. Please try again';
    }
  }

  static getFirestoreErrorMessage(error) {
    const code = error?.code || error?.message || '';
    
    switch (code) {
      case 'permission-denied':
        return 'Access denied. Please login again';
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again';
      case 'deadline-exceeded':
        return 'Request timed out. Please try again';
      case 'invalid-argument':
        return 'Invalid data. Please check your input';
      default:
        return 'Database error. Please try again';
    }
  }

  static getOrderErrorMessage(error) {
    const message = error?.message || '';
    
    if (message.includes('userId')) {
      return 'Please login again to place order';
    }
    if (message.includes('permission')) {
      return 'Unable to place order. Please login again';
    }
    if (message.includes('network')) {
      return 'Network error. Please check your connection';
    }
    
    return 'Failed to place order. Please try again';
  }

  static handleNetworkError(error) {
    toast.error('Network error. Please check your connection');
    this.logError(error, 'NETWORK');
  }

  static showSuccess(message) {
    toast.success(message);
  }

  static showInfo(message) {
    toast(message, { icon: 'ℹ️' });
  }
}

export default ErrorHandler;
