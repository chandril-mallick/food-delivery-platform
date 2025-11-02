import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { subscribeToAppStatus } from './firebase/firestore';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage'));
const Offers = lazy(() => import('./pages/Offers'));
const Support = lazy(() => import('./pages/Support'));
// Dev/test only components (lazy so they stay code-split)
const FirebaseTest = lazy(() => import('./components/FirebaseTest'));
const ProductionReadinessCheck = lazy(() => import('./components/ProductionReadinessCheck'));

// Dev flags (do not expose seeding in production)
const enableDev = process.env.REACT_APP_ENABLE_DEV === 'true';
// Lazy require so builds don't break if file is moved/absent
// eslint-disable-next-line global-require
const DataSeeder = enableDev ? require('./components/DataSeeder').default : null;

// Main App Component
const AppContent = () => {
  const [appStatus, setAppStatus] = useState({ isOpen: true, message: '' });

  useEffect(() => {
    const unsub = subscribeToAppStatus((status) => {
      setAppStatus(status);
    });
    return () => unsub && unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      }>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/support" element={<Support />} />
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } />
        {enableDev && DataSeeder && (
          <Route
            path="/dev/seed-data"
            element={
              <ProtectedRoute>
                <DataSeeder />
              </ProtectedRoute>
            }
          />
        )}
        {/* Cart and Order Routes */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success" element={
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/order-tracking/:orderId" element={
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        } />
        <Route path="/order-history" element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        } />
        
        {/* User Profile Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/account-settings" element={
          <ProtectedRoute>
            <AccountSettingsPage />
          </ProtectedRoute>
        } />
        
        {/* Development/Testing Routes */}
        {enableDev && (
          <Route path="/firebase-test" element={
            <Suspense fallback={<div>Loading...</div>}>
              <FirebaseTest />
            </Suspense>
          } />
        )}
        {enableDev && (
          <Route path="/production-check" element={
            <Suspense fallback={<div>Loading...</div>}>
              <ProductionReadinessCheck />
            </Suspense>
          } />
        )}
      </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
      {!appStatus.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-6">
          <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-orange-200">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
  <span className="text-3xl">🚧</span>
</div>
<h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Kitchen is Currently Closed</h2>
<p className="text-gray-600 mb-4">
  {appStatus.message || "Thank you for stopping by! Our kitchen is now resting and will reopen at 6:00 AM. We serve fresh, homestyle meals daily from 6:00 AM to 11:59 PM."}
</p>
<div className="text-sm text-gray-500">This page updates automatically with our live status.</div>

          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
