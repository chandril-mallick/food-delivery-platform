import React, { useEffect, useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { getMenuItems } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Heart, 
  Star, 
  Clock, 
  Users, 
  Search, 
  Plus, 
  Minus,
  ShoppingBag,
  Sparkles,
  ChefHat,
  Leaf,
  Award,
  Zap
} from 'lucide-react';

const Menu = () => {
  const { addToCart, cartItems } = useCart();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const menuItems = await getMenuItems();
        setFoodItems(menuItems);
        
        // Initialize quantities from cart
        const quantities = {};
        cartItems.forEach(item => {
          quantities[item.id] = item.quantity || 0;
        });
        setItemQuantities(quantities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [cartItems]);

  const handleAddToCart = (item) => {
    // Add haptic feedback for mobile
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(50);
    }
    
    addToCart(item);
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
    
    toast.success(
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4" />
        <span>{item.name} added to cart!</span>
      </div>, 
      {
        duration: 2000,
        style: {
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: "500",
          borderRadius: "12px",
          padding: "12px 16px"
        }
      }
    );
  };

  const handleQuantityChange = (item, change) => {
    const currentQty = itemQuantities[item.id] || 0;
    const newQty = Math.max(0, currentQty + change);
    
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(30);
    }
    
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: newQty
    }));
    
    if (change > 0) {
      addToCart(item);
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'main-course', label: 'Mains', icon: ChefHat, color: 'from-orange-500 to-red-500' },
    { id: 'snacks', label: 'Snacks', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { id: 'sweets', label: 'Sweets', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'beverages', label: 'Drinks', icon: Award, color: 'from-blue-500 to-cyan-500' }
  ];

  // Filter items by category and search query
  const filteredItems = foodItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex justify-center items-center px-4">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="w-16 h-16 mx-auto mb-4 border-4 border-orange-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <p className="text-orange-600 font-medium text-lg">Loading delicious dishes...</p>
          <p className="text-gray-500 text-sm mt-2">Prepared with love and flavor</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex justify-center items-center px-4">
        <motion.div
          className="bg-white border border-red-200 text-red-700 p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-3">Failed to load menu</h2>
          <p className="mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full hover:from-red-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (foodItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex justify-center items-center px-4">
        <motion.div
          className="bg-white border border-yellow-200 text-yellow-700 p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold mb-3">No items available yet</h2>
          <p className="text-sm">Please add dishes to the Firestore "menuItems" collection.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-100">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl" />
      </div>
      {/* Modern Header */}
      

      {/* Category Filter + Search Toggle */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => {
                    if (navigator.vibrate && isMobile) navigator.vibrate(30);
                    setSelectedCategory(category.id);
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 text-sm min-w-max active:scale-95 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-md ring-1 ring-white/20`
                      : 'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
          <button
            onClick={toggleSearch}
            className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-colors active:scale-95"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-200" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative mb-3 px-4">
              <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 text-white placeholder:text-gray-400 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-transparent text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item, index) => {
            const quantity = itemQuantities[item.id] || 0;
            return (
              <motion.div
                key={item.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-md border border-white/10 overflow-hidden active:scale-[0.98] transition-all duration-200 hover:shadow-lg hover:border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                  
                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full shadow-sm active:scale-90 transition-transform">
                    <Heart className="w-4 h-4 text-gray-300" />
                  </button>
                  
                  {/* Special Badge */}
                  {item.isSpecial && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Special</span>
                    </div>
                  )}
                  
                  {/* Vegetarian Badge */}
                  {item.isVeg && (
                    <div className="absolute bottom-3 left-3 bg-green-500 text-white p-1 rounded-full ring-2 ring-white/30">
                      <Leaf className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                    <div className="flex items-center gap-1 bg-green-500/15 px-2 py-1 rounded-lg border border-green-500/20">
                      <Star className="w-3 h-3 text-green-400 fill-current" />
                      <span className="text-xs font-medium text-green-300">{item.rating || '4.5'}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {item.description || "Delicious homemade dish prepared with love and authentic flavors."}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
                    {item.prepTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.prepTime}</span>
                      </div>
                    )}
                    {item.serves && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Serves {item.serves}</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Add to Cart */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-white">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    {quantity > 0 ? (
                      <div className="flex items-center gap-3 bg-orange-500/10 rounded-xl p-1 border border-orange-400/20">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className="p-2 rounded-lg bg-white/10 border border-white/10 shadow-sm active:scale-90 transition-transform"
                        >
                          <Minus className="w-4 h-4 text-orange-300" />
                        </button>
                        <span className="font-semibold text-orange-300 min-w-[20px] text-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm active:scale-90 transition-transform"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all duration-200 shadow-lg flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No dishes found' : 'No dishes in this category'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try searching for something else' : 'Please choose a different category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;
