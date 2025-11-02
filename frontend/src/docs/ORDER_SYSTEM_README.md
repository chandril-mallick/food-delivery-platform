# Order Management System - Dabba App

## Overview
A comprehensive order placement and management system built with React and Firebase Firestore for the Dabba food delivery app.

## Features

### Customer Features
- **Cart Management**: Add, remove, and modify items in cart
- **Checkout Process**: Complete order placement with delivery details
- **Order Tracking**: Real-time order status updates
- **Order History**: View past orders with filtering options
- **Order Cancellation**: Cancel orders within allowed timeframe

### Admin Features
- **Order Management Dashboard**: View and manage all orders
- **Status Updates**: Update order status through workflow
- **Real-time Updates**: Live order status changes
- **Order Filtering**: Filter orders by status
- **Quick Actions**: Batch status updates

## System Architecture

### Core Components

#### 1. Firebase Integration (`/src/firebase/firestore.js`)
- Complete CRUD operations for orders
- Real-time subscriptions
- User profile management
- Menu item management

#### 2. Order Service (`/src/services/orderService.js`)
- Business logic for order operations
- Order validation and formatting
- Status management utilities
- Pricing calculations

#### 3. Customer Components
- **Checkout** (`/src/components/Checkout.jsx`): Complete checkout flow
- **OrderTracking** (`/src/components/OrderTracking.jsx`): Real-time order tracking
- **OrderHistory** (`/src/components/OrderHistory.jsx`): Order history with filters
- **OrderSuccess** (`/src/components/OrderSuccess.jsx`): Order confirmation page

#### 4. Admin Components
- **AdminOrderManagement** (`/src/components/AdminOrderManagement.jsx`): Complete admin dashboard

#### 5. Pages
- **OrderTrackingPage** (`/src/pages/OrderTrackingPage.jsx`)
- **OrderHistoryPage** (`/src/pages/OrderHistoryPage.jsx`)
- **OrderSuccessPage** (`/src/pages/OrderSuccessPage.jsx`)

## Order Workflow

### Order Status Flow
1. **Pending** → Order placed, awaiting confirmation
2. **Confirmed** → Restaurant confirmed the order
3. **Preparing** → Food is being prepared
4. **Out for Delivery** → Order is on the way
5. **Delivered** → Order successfully delivered
6. **Cancelled** → Order was cancelled

### Data Structure

#### Order Document
```javascript
{
  id: "auto-generated",
  userId: "user-id",
  orderNumber: "ORD-1234567890",
  status: "pending",
  items: [
    {
      id: "item-id",
      name: "Item Name",
      price: 150,
      qty: 2,
      image: "image-url",
      category: "category"
    }
  ],
  deliveryAddress: {
    street: "Street Address",
    city: "City",
    state: "State",
    pincode: "123456",
    landmark: "Optional landmark"
  },
  contactNumber: "9876543210",
  paymentMethod: "cash_on_delivery",
  specialInstructions: "Optional instructions",
  pricing: {
    subtotal: 300,
    deliveryFee: 50,
    taxes: 15,
    total: 365
  },
  createdAt: "timestamp",
  updatedAt: "timestamp",
  estimatedDeliveryTime: "timestamp"
}
```

## Usage

### Setting up Routes
Add these routes to your React Router configuration:

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from './pages/Cart';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/cart" element={<Cart userId={currentUserId} />} />
        <Route path="/order-tracking/:orderId" element={<OrderTrackingPage userId={currentUserId} />} />
        <Route path="/order-history" element={<OrderHistoryPage userId={currentUserId} />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
      </Routes>
    </Router>
  );
}
```

### Customer Order Flow

#### 1. Placing an Order
```javascript
import OrderService from '../services/orderService';

const orderData = {
  userId: 'user-123',
  items: cartItems,
  deliveryAddress: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  },
  contactNumber: '9876543210',
  paymentMethod: 'cash_on_delivery',
  specialInstructions: 'Ring the bell twice'
};

try {
  const result = await OrderService.placeOrder(orderData);
  console.log('Order placed:', result);
} catch (error) {
  console.error('Order failed:', error.message);
}
```

#### 2. Tracking an Order
```javascript
import OrderService from '../services/orderService';

// Get order details
const order = await OrderService.getOrderDetails(orderId);

// Subscribe to real-time updates
const unsubscribe = OrderService.subscribeToOrderUpdates(orderId, (updatedOrder) => {
  console.log('Order updated:', updatedOrder);
});

// Cleanup subscription
unsubscribe();
```

#### 3. Getting Order History
```javascript
import OrderService from '../services/orderService';

const orders = await OrderService.getOrderHistory(userId);
console.log('User orders:', orders);
```

### Admin Order Management

#### 1. Getting All Orders
```javascript
import { getAllOrders, getOrdersByStatus } from '../firebase/firestore';

// Get all orders
const allOrders = await getAllOrders(50);

// Get orders by status
const pendingOrders = await getOrdersByStatus('pending');
```

#### 2. Updating Order Status
```javascript
import OrderService from '../services/orderService';

await OrderService.updateStatus(orderId, 'confirmed');
```

## Real-time Features

### Customer Real-time Updates
- Order status changes are pushed in real-time
- Estimated delivery time updates
- Automatic UI updates without refresh

### Admin Real-time Updates
- New orders appear automatically
- Status changes reflect immediately
- Live order count updates

## Pricing Logic

### Delivery Fee Calculation
- Free delivery for orders above ₹500
- ₹50 delivery fee for orders below ₹500

### Tax Calculation
- 5% tax on subtotal

### Total Calculation
```
Total = Subtotal + Delivery Fee + Taxes
```

## Error Handling

### Order Placement Errors
- Validation errors for incomplete data
- Network errors with retry options
- Payment method validation

### Real-time Connection Errors
- Automatic reconnection
- Offline state handling
- Error notifications

## Security Features

### Data Validation
- Server-side validation for all order data
- Input sanitization
- User authentication checks

### Access Control
- Users can only access their own orders
- Admin role verification for management features
- Secure Firebase rules

## Performance Optimizations

### Database Queries
- Indexed queries for fast retrieval
- Pagination for large order lists
- Efficient real-time subscriptions

### UI Optimizations
- Loading states for all async operations
- Optimistic updates where appropriate
- Lazy loading for order history

## Dependencies

### Required Packages
```json
{
  "firebase": "^9.x.x",
  "react": "^18.x.x",
  "react-router-dom": "^6.x.x",
  "react-hot-toast": "^2.x.x"
}
```

### Firebase Configuration
Ensure these environment variables are set:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if request.auth != null && 
                  (resource.data.userId == request.auth.uid || 
                   request.auth.token.admin == true);
      
      // Users can create orders for themselves
      allow create: if request.auth != null && 
                    request.auth.uid == resource.data.userId;
      
      // Only admins can update orders
      allow update: if request.auth != null && 
                    request.auth.token.admin == true;
      
      // Only admins can delete orders
      allow delete: if request.auth != null && 
                    request.auth.token.admin == true;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == userId;
    }
    
    // Menu items collection (read-only for users)
    match /menuItems/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
  }
}
```

## Testing

### Unit Tests
- Order service functions
- Validation logic
- Pricing calculations

### Integration Tests
- Firebase operations
- Component interactions
- Real-time updates

### E2E Tests
- Complete order flow
- Admin management workflow
- Error scenarios

## Deployment

### Environment Setup
1. Configure Firebase project
2. Set up Firestore database
3. Configure authentication
4. Deploy security rules

### Production Considerations
- Enable Firebase Analytics
- Set up monitoring and alerts
- Configure backup strategies
- Implement rate limiting

## Support

For issues or questions about the order system:
1. Check the component documentation
2. Review Firebase console for errors
3. Check browser console for client-side errors
4. Verify environment variables are set correctly

## Future Enhancements

### Planned Features
- Online payment integration
- Order scheduling
- Bulk order management
- Advanced analytics
- Push notifications
- SMS notifications
- Order rating and reviews
- Loyalty program integration
