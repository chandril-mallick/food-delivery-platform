import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Checkout from "../components/Checkout";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Clock,
  CreditCard,
  Tag,
  Sparkles
} from "lucide-react";


const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    subtotal,
  } = useCart();
  const { isAuthenticated, user, provider } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [removingItems, setRemovingItems] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleHapticFeedback = () => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(30);
    }
  };

  const handleQuantityChange = (itemId, change) => {
    handleHapticFeedback();
    if (change > 0) {
      increaseQty(itemId);
    } else {
      decreaseQty(itemId);
    }
  };

  const handleRemoveItem = async (itemId) => {
    handleHapticFeedback();
    setRemovingItems(prev => new Set([...prev, itemId]));
    
    // Add a small delay for animation
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      toast.success('Item removed from cart');
    }, 200);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    
    handleHapticFeedback();
    setShowCheckout(true);
  };

  const handleOrderSuccess = (orderResult) => {
    // Show success toast with order details
    toast.success('Order placed successfully! Redirecting to your orders...');
    
    // First navigate to order success page briefly
    navigate('/order-success', { 
      state: { 
        order: {
          ...orderResult,
          // Add additional order details if needed
          estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        },
        fromCheckout: true,
        autoRedirect: true // Flag to auto-redirect to orders
      } 
    });
    
    // After 3 seconds, automatically redirect to orders page
    setTimeout(() => {
      navigate('/orders');
    }, 3000);
  };

  // Pricing calculations - matching Checkout component
  const deliveryFee = 0; // Free delivery for all
  const platformFee = 2.5; // Platform fee
  const total = subtotal + deliveryFee + platformFee; // Subtotal + delivery fee + platform fee

  if (showCheckout) {
    const resolvedUserId = provider === 'supabase' ? user?.id : user?.uid;
    return (
      <Checkout 
        userId={resolvedUserId}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-gray-200" />
            </button>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-orange-400" />
              <div>
                <h1 className="text-xl font-bold text-white">My Cart</h1>
                <p className="text-sm text-gray-300">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-500/15 rounded-full flex items-center justify-center border border-orange-400/20">
              <ShoppingBag className="w-12 h-12 text-orange-300" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
            <p className="text-gray-300 mb-8 max-w-sm">
              Looks like you haven't added any delicious items to your cart yet.
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-all duration-200 shadow-lg"
            >
              Browse Menu
            </button>
          </motion.div>
        </div>
      ) : (
        /* Cart Items */
        <div className="pb-40">
          <div className="px-4 py-4">
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`bg-white/5 backdrop-blur-sm rounded-2xl shadow-md border border-white/10 mb-4 overflow-hidden ${
                    removingItems.has(item.id) ? 'opacity-50 scale-95' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || '/api/placeholder/80/80'}
                          alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white text-lg leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded-full hover:bg-red-500/10 active:scale-90 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-white">
                              ₹{item.price * item.qty}
                            </span>
                            <span className="text-sm text-gray-300">
                              ₹{item.price} each
                            </span>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-orange-500/10 rounded-xl p-1 border border-orange-400/20">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="p-2 rounded-lg bg-white/10 border border-white/10 shadow-sm active:scale-90 transition-transform"
                            >
                              <Minus className="w-4 h-4 text-orange-300" />
                            </button>
                            <span className="font-semibold text-orange-300 min-w-[24px] text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm active:scale-90 transition-transform"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="px-4 mb-4">
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-md border border-white/10 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-400" />
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-medium text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Delivery Fee</span>
                  </div>
                  <span className="font-medium text-green-300">Free delivery</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Platform Fee</span>
                  </div>
                  <span className="font-medium text-white">₹2.5</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Taxes & Fees</span>
                  </div>
                  <span className="font-medium text-gray-400">No taxes</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-xl font-bold text-orange-300">₹{total}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Delivery Info */}
          <div className="px-4 mb-6 space-y-3">
            <motion.div
              className="rounded-2xl p-4 border border-green-500/20 bg-green-500/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <Clock className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <p className="font-semibold text-green-300">Delivery in 30 minutes</p>
                  <p className="text-sm text-green-400">Fresh food delivered to your doorstep</p>
                </div>
              </div>
            </motion.div>
            
            {/* University Delivery Promotion */}
            <motion.div
              className="rounded-2xl p-4 border border-orange-500/20 bg-orange-500/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-full">
                  <span className="text-lg">🎓</span>
                </div>
                <div>
                  <p className="font-semibold text-orange-300">University Student?</p>
                  <p className="text-sm text-orange-300/80">Get FREE delivery to your campus! Select university delivery at checkout.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Checkout Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 p-4 shadow-lg z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
          <motion.button
            onClick={handleProceedToCheckout}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform duration-200"
            whileTap={{ scale: 0.95 }}
            disabled={cartItems.length === 0}
          >
            <Sparkles className="w-5 h-5" />
            <span>Proceed to Checkout • ₹{total}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Cart;


