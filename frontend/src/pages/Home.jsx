import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { MapPin, Clock, Star, Plus, ChevronRight, User, GraduationCap, Building2, Users, CheckCircle, Tag } from 'lucide-react';
import { getPopularMenuItems, getOffers, getCollection } from '../firebase/firestore';

// Env flag for development logging
const isDev = process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_DEV === 'true';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [popularMenuItems, setPopularMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [motherStory, setMotherStory] = useState(null);
  const [motherStories, setMotherStories] = useState([]);
  const [motherStoriesLoading, setMotherStoriesLoading] = useState(true);
  const [activeOffers, setActiveOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
 

  const handleOrderNow = () => {
    if (user) {
      navigate('/menu');
    } else {
      navigate('/login');
    }
  };

  const handleAddToCart = (dish) => {
    // Native haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    if (user) {
      addToCart(dish);
      toast.success(`${dish.name} added to cart!`, {
        duration: 2000,
        style: {
          background: '#10B981',
          color: 'white',
          borderRadius: '12px',
        },
      });
    } else {
      toast.error('Please login to add items to cart');
      navigate('/login');
    }
  };

  // Pull to refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const items = await getPopularMenuItems();
      setPopularMenuItems(items || []);
      toast.success('Refreshed!', {
        duration: 1500,
        style: {
          background: '#3B82F6',
          color: 'white',
          borderRadius: '12px',
        },
      });
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch popular menu items from Firebase
  useEffect(() => {
    const fetchPopularMenuItems = async () => {
      try {
        setLoading(true);
        const items = await getPopularMenuItems();
        setPopularMenuItems(items || []); // Ensure we always have an array
      } catch (error) {
        console.error('Error fetching popular menu items:', error);
        // Set empty array if Firebase fails - will show empty state
        setPopularMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMenuItems();
  }, []);

  // Fetch Active Offers (top 2)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setOffersLoading(true);
        const data = await getOffers();
        // Basic sort by a heuristic if fields exist; otherwise keep order
        const sorted = Array.isArray(data) ? [...data] : [];
        const topTwo = sorted.slice(0, 2);
        setActiveOffers(topTwo);
      } catch (e) {
        setActiveOffers([]);
      } finally {
        setOffersLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Fetch Mother Story (CMS) content from Firebase: collection 'cms', doc 'motherStory'
  useEffect(() => {
    /**
     * Fetches the Mother Story content from Firestore collection 'cms'.
     * If the document is not found, uses a fallback object with sample content.
     * Sets `motherStory` state with the fetched data, or the fallback object.
     */
    const fetchMotherStory = async () => {
      try {
        const docs = await getCollection('cms');
        const first = Array.isArray(docs) && docs.length ? docs[0] : null;
        setMotherStory(first || null);
      } catch (err) {
        if (isDev) {
          // eslint-disable-next-line no-console
          console.warn("Mother Story not found in Firestore collection 'cms'. Using fallback.");
        }
        setMotherStory({
          title: "A Mother's Story",
          subtitle: 'Why we cook with love',
          content:
            "Dabba Bot started with a simple promise: to bring the warmth of a mother's kitchen to every student away from home. Every meal is prepared fresh, with simple ingredients and homely flavours—just like mom makes.",
          imageUrl: '/mother-story-fallback.jpg',
          author: 'Dabba Maa',
          highlight: 'Fresh. Simple. Made with love.'
        });
      } finally {
        // No loading state for single mother story, it depends on motherStoriesLoading for the carousel
      }
    };

    fetchMotherStory();
  }, []);

  // Fetch multiple Mother Stories (horizontal carousel) from cms/motherStories
  useEffect(() => {
    const fetchMotherStories = async () => {
      try {
        setMotherStoriesLoading(true);
        const docs = await getCollection('cms');
        const normalized = (docs || []).map((it, idx) => ({
          id: it.id || `story-${idx}`,
          title: it.title || "A Mother's Story",
          subtitle: it.subtitle || 'Why we cook with love',
          content: it.content || 'We cook fresh, homely meals that remind you of home.',
          imageUrl: it.imageUrl || '/mother-story-fallback.jpg',
          author: it.author || 'Dabba Maa',
          highlight: it.highlight || 'Fresh. Simple. Made with love.'
        }));
        setMotherStories(
          normalized.length
            ? normalized
            : [
                {
                  id: 'fallback-1',
                  title: motherStory?.title || "A Mother's Story",
                  subtitle: motherStory?.subtitle || 'Why we cook with love',
                  content: motherStory?.content || 'We cook fresh, homely meals that remind you of home.',
                  imageUrl: motherStory?.imageUrl || '/mother-story-fallback.jpg',
                  author: motherStory?.author || 'Dabba Maa',
                  highlight: motherStory?.highlight || 'Fresh. Simple. Made with love.'
                }
              ]
        );
      } catch (e) {
        if (isDev) {
          // eslint-disable-next-line no-console
          console.warn("Failed to fetch stories from Firestore collection 'cms'. Using single fallback.");
        }
        setMotherStories([
          {
            id: 'fallback-1',
            title: motherStory?.title || "A Mother's Story",
            subtitle: motherStory?.subtitle || 'Why we cook with love',
            content: motherStory?.content || 'We cook fresh, homely meals that remind you of home.',
            imageUrl: motherStory?.imageUrl || '/mother-story-fallback.jpg',
            author: motherStory?.author || 'Dabba Maa',
            highlight: motherStory?.highlight || 'Fresh. Simple. Made with love.'
          }
        ]);
      } finally {
        setMotherStoriesLoading(false);
      }
    };

    fetchMotherStories();
    // Depend on motherStory so fallbacks use latest
  }, [motherStory]);

  // Get popular dishes (limited to 2) - directly from popular menu collection
  const popularDishes = popularMenuItems.slice(0, 2);



  const quickActions = [
    { 
      icon: '🍽️', 
      title: 'Order Food', 
      subtitle: 'Browse menu', 
      action: () => {
        if (navigator.vibrate) navigator.vibrate(30);
        navigate('/menu');
      },
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    { 
      icon: '📦', 
      title: 'Track Order', 
      subtitle: 'Live tracking', 
      action: () => {
        if (navigator.vibrate) navigator.vibrate(30);
        navigate('/orders');
      },
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    { 
      icon: '🎁', 
      title: 'Offers', 
      subtitle: 'Save more', 
      action: () => {
        if (navigator.vibrate) navigator.vibrate(30);
        navigate('/offers');
      },
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600'
    },
    { 
      icon: '💬', 
      title: 'Support', 
      subtitle: '24/7 help', 
      action: () => {
        if (navigator.vibrate) navigator.vibrate(30);
        navigate('/support');
      },
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
  ];

  const monthlyPlans = [
    {
      id: 1,
      name: 'Basic Plan',
      price: 1999,
      originalPrice: 2999,
      meals: 60,
      description: '2 meal per day',
      features: ['Free delivery', 'Variety menu', 'No commitment'],
      popular: false
    },
    {
      id: 2,
      name: 'Standard Plan',
      price: 2999,
      originalPrice: 3999,
      meals: 90,
      description: '3 meals per day',
      features: ['Free delivery', 'Priority support', 'Custom menu'],
      popular: true
    },
    {
      id: 3,
      name: 'Premium Plan',
      price: 4999,
      originalPrice: 6999,
      meals: 'Unlimited',
      description: 'Unlimited meals',
      features: ['Free delivery', 'Premium menu', 'Dedicated chef', '24/7 support'],
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Native Mobile Status Bar */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white md:hidden">
        <div className="flex items-center justify-between px-4 py-1 text-xs">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span className="ml-2">Dabba Bot</span>
          </div>
          <div className="text-xs">6AM - 12PM </div>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Mobile Location Header with Pull-to-Refresh */}
      <div className="sticky top-0 bg-white shadow-sm z-40 md:hidden">
        {/* Pull to refresh indicator */}
        {refreshing && (
          <div className="flex items-center justify-center py-2 bg-blue-50">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-xs text-blue-600 font-medium">Refreshing...</span>
          </div>
        )}
        
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Delivering Mother's love from </p>
              <p className="text-xs text-gray-600"> Dabba Bot</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
            >
              <User className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl opacity-20">🍳</div>
          <div className="absolute top-20 right-20 text-4xl opacity-20">🍛</div>
          <div className="absolute bottom-10 left-20 text-5xl opacity-20">🍲</div>
          <div className="absolute bottom-20 right-10 text-3xl opacity-20">❤️</div>
        </div>
        
        <div className="relative z-10 px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Craving 
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Mom's Food?
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Get authentic homestyle meals delivered fresh to your campus in just 25 minutes!
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={handleOrderNow}
                className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center"
              >
                Order Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all duration-300 transform hover:scale-105"
              >
                View Menu
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-orange-100">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-300 fill-current" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>15 Min Delivery</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>100+ Happy Students&Faculty </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Free Campus Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mother Stories Section (Horizontal Scroll) */}
      <div className="px-4 py-10 md:py-16 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              <span>👩‍🍳</span>
              <span>From a Mother's Kitchen</span>
            </div>
            <span className="text-xs text-gray-500">Swipe to explore →</span>
          </div>

          {/* Horizontal scroller */}
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            <div className="flex gap-4 md:gap-6">
              {(motherStoriesLoading ? Array.from({ length: 3 }) : motherStories).map((item, idx) => (
                <div key={item?.id || `skeleton-${idx}`} className="snap-start shrink-0 w-[85%] sm:w-[70%] md:w-[520px]">
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
                    {/* Image */}
                    <div className="relative">
                      {motherStoriesLoading ? (
                        <div className="aspect-[16/9] animate-pulse bg-orange-100" />
                      ) : (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover aspect-[16/9]"
                        />
                      )}
                      {!motherStoriesLoading && item.highlight && (
                        <div className="absolute bottom-2 left-2 bg-white/90 text-orange-700 text-xs font-semibold px-2 py-1 rounded-lg shadow">
                          ✨ {item.highlight}
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="p-5">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">{motherStoriesLoading ? 'Loading…' : item.title}</h3>
                      {!motherStoriesLoading && item.subtitle && (
                        <p className="text-sm text-orange-700 mt-1">{item.subtitle}</p>
                      )}
                      <p className="mt-3 text-sm text-gray-700 line-clamp-4">{motherStoriesLoading ? 'Please wait…' : item.content}</p>
                      {!motherStoriesLoading && (
                        <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                          <div className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center">🧡</div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">{item.author}</span>
                            <span>Founder • Homestyle Kitchen</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-6 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`flex flex-col items-center p-4 ${action.bgColor} rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <div className={`w-12 h-12 ${action.iconBg} rounded-2xl flex items-center justify-center mb-3 shadow-sm`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <span className={`text-xs font-bold ${action.textColor} mb-1`}>{action.title}</span>
              <span className="text-xs text-gray-500">{action.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Offers Rail */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Active Offers</h3>
          <button onClick={() => navigate('/offers')} className="text-orange-500 text-sm font-semibold flex items-center">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4">
            {offersLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={`offer-skel-${i}`} className="min-w-[260px] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-40 bg-gray-200 rounded mb-1" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
              ))
            ) : activeOffers.length ? (
              activeOffers.map((offer) => (
                <div key={offer.id} className="min-w-[260px] relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
                  <div className={`absolute inset-0 bg-gradient-to-r ${offer.color || 'from-orange-500 to-amber-500'} opacity-10`} />
                  <div className="relative z-10 p-4">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{offer.title}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{offer.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{offer.terms}</div>
                    <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg font-mono font-bold text-xs">
                      {offer.code}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No active offers right now.</div>
            )}
          </div>
        </div>
      </div>

      {/* Order Now Section */}
      <div className="px-4 py-6 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Missing Mom's Homemade Food? 👩‍🍳</h3>
          <p className="text-gray-600 mb-6">Delicious home-style meals made with love, just like mom's!</p>
          
          
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              <span>30 min delivery</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              <span>4.9★ rated</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>Fresh & hot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brainware University Campus Card */}
      <div className="mx-4 mb-6">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-4 text-4xl">🎓</div>
            <div className="absolute bottom-2 left-4 text-3xl">🏢</div>
            <div className="absolute top-4 left-8 text-2xl">📚</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-200">NOW AVAILABLE</span>
                </div>
                <h3 className="text-xl font-bold mb-1">🎓 Brainware University Campus</h3>
                <p className="text-blue-100 text-sm mb-3">Free delivery to all campus locations • 15 min guarantee</p>
                <div className="flex items-center text-xs text-blue-200 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>All Hostels & Departments</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>6 AM - 12 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <button
                  onClick={handleOrderNow}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Order Now
                </button>
              </div>
            </div>
            
            {/* Special Offer */}
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-yellow-200">✨ Campus Special:</span>
                  <span className="text-sm text-white ml-2">Brainware University Campus for 25% OFF</span>
                </div>
                <div className="text-xs text-blue-200">
                  Valid till midnight
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Dishes */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Popular near you</h3>
          <button 
            onClick={() => navigate('/menu')}
            className="text-orange-500 text-sm font-semibold flex items-center"
          >
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))
          ) : popularDishes.length > 0 ? (
            popularDishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                {(() => {
                  const url = dish.imageUrl || dish.image;
                  const isUrl = typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));
                  return isUrl ? (
                    <div className="h-32 bg-gray-100">
                      <img
                        src={url}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <span className="text-4xl">{dish.image || '🍽️'}</span>
                    </div>
                  );
                })()}
                {dish.discount && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {dish.discount}
                  </div>
                )}
                {dish.isVeg && (
                  <div className="absolute top-2 right-2 w-4 h-4 border-2 border-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 mb-1">{dish.name}</h4>
                <p className="text-xs text-gray-600 mb-2 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{dish.description}</p>
                
                <div className="flex items-center mb-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">{dish.rating}</span>
                  <span className="text-xs text-gray-400 mx-1">•</span>
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600 ml-1">{dish.deliveryTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-gray-800">₹{dish.price}</span>
                    {dish.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">₹{dish.originalPrice}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            ))
          ) : (
            // Empty state when no popular dishes found
            <div className="col-span-full text-center py-8">
              <div className="text-6xl mb-4">🍽️</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No popular dishes found</h4>
              <p className="text-gray-600 mb-4">Check back later for our popular items!</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Browse Full Menu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* University Delivery Section */}
      <div className="px-4 py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-10 h-10 text-blue-600 mr-4" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                University Delivery
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              FREE campus delivery to all major universities.
            </p>
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              <CheckCircle className="w-5 h-5 mr-3" />
              Zero Delivery Charges • 30 Min Guarantee
            </div>
          </div>

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Brainware University',
                campuses: ['Main Campus', 'Hostel Area'],
                icon: '🏛️',
                students: '20K+',
                color: 'from-red-400 to-pink-500'
              },
              
              
              {
                name: 'Other University',
                campuses: ['Comming Soon'],
                icon: '🏢',
                
                color: 'from-teal-400 to-cyan-500'
              }
            ].map((university, index) => (
              <div 
                key={university.name}
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${university.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">{university.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{university.name}</h3>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center bg-blue-50 px-3 py-2 rounded-full">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-semibold">{university.students}</span>
                      </div>
                      <div className="flex items-center bg-green-50 px-3 py-2 rounded-full">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-semibold">{university.deliveries}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700 mb-3 text-center">Campus Locations:</p>
                    {university.campuses.slice(0, 4).map((campus, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <Building2 className="w-4 h-4 mr-3 text-blue-400 flex-shrink-0" />
                        <span>{campus}</span>
                      </div>
                    ))}
                    {university.campuses.length > 4 && (
                      <div className="text-center text-sm text-blue-600 font-semibold mt-3">
                        +{university.campuses.length - 4} more locations
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              {
                icon: <Clock className="w-8 h-8 text-blue-600" />,
                title: '30 Min Delivery',
                description: 'Fast delivery to your hostel or department',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200'
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-green-600" />,
                title: 'FREE Delivery',
                description: 'Zero delivery charges on all campus orders',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
              },
              {
                icon: <MapPin className="w-8 h-8 text-purple-600" />,
                title: 'Precise Location',
                description: 'Detailed campus address with building & room',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200'
              },
              {
                icon: <Star className="w-8 h-8 text-yellow-600" />,
                title: 'Student Favorite',
                description: '4.9★ rating from university students',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`text-center p-6 ${feature.bgColor} rounded-2xl border-2 ${feature.borderColor} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-gray-800 mb-3 text-lg">{feature.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

        
        </div>
      </div>

      {/* Special Offer Banner */}
      <div className="mx-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">🎉 Special Offer!</h3>
              
            </div>
            <button 
              onClick={handleOrderNow}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Claim Now
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Pricing Plans */}
      <div className="py-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-6xl animate-pulse">🍽️</div>
          <div className="absolute top-20 right-20 text-4xl animate-bounce">💰</div>
          <div className="absolute bottom-10 left-20 text-5xl animate-pulse">⭐</div>
          <div className="absolute bottom-20 right-10 text-3xl animate-bounce">🎯</div>
        </div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-12 px-4">
            <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span className="animate-pulse mr-2">💎</span>
              PREMIUM MEAL PLANS
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Choose Your
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Perfect Plan</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Save more with our monthly subscription plans and never worry about meals again
            </p>
          </div>
          
          {/* Horizontal Scrolling Plans */}
          <div className="relative">
            <div className="flex space-x-6 overflow-x-auto px-4 pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitScrollbar: 'none'}}>
              {monthlyPlans.map((plan, index) => (
                <div 
                  key={plan.id} 
                  className={`relative flex-shrink-0 w-80 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl transform animate-bounce ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl scale-105' 
                      : 'bg-white border-2 border-gray-200 hover:border-orange-300 shadow-lg'
                  }`}
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-bounce">
                        ⭐ MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  {/* Plan Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto ${
                    plan.popular ? 'bg-white/20' : 'bg-orange-100'
                  }`}>
                    {plan.id === 'basic' ? '🥗' : plan.id === 'standard' ? '🍛' : '👑'}
                  </div>
                  
                  {/* Plan Details */}
                  <div className="text-center">
                    <h4 className={`text-2xl font-bold mb-3 ${
                      plan.popular ? 'text-white' : 'text-gray-800'
                    }`}>
                      {plan.name}
                    </h4>
                    
                    {/* Pricing */}
                    <div className="mb-6">
                      <div className={`text-5xl font-bold mb-2 ${
                        plan.popular ? 'text-white' : 'text-orange-600'
                      }`}>
                        ₹{plan.price}
                      </div>
                      <div className={`text-sm line-through mb-1 ${
                        plan.popular ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        ₹{plan.originalPrice}
                      </div>
                      <div className={`text-sm font-semibold ${
                        plan.popular ? 'text-yellow-200' : 'text-green-600'
                      }`}>
                        Save ₹{plan.originalPrice - plan.price} 💰
                      </div>
                      <div className={`text-xs mt-1 ${
                        plan.popular ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {plan.description}
                      </div>
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li 
                          key={featureIndex} 
                          className={`flex items-center text-sm ${
                            plan.popular ? 'text-white' : 'text-gray-600'
                          }`}
                          style={{
                            animationDelay: `${(index * 0.2) + (featureIndex * 0.1)}s`
                          }}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                            plan.popular ? 'bg-white/20' : 'bg-green-100'
                          }`}>
                            <span className={`text-xs ${
                              plan.popular ? 'text-white' : 'text-green-600'
                            }`}>✓</span>
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <button 
                      onClick={handleOrderNow}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? 'bg-white text-orange-600 hover:bg-gray-100 shadow-lg'
                          : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {plan.popular ? '🚀 Get Started' : 'Choose Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {monthlyPlans.map((_, index) => (
                <div 
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"
                  style={{animationDelay: `${index * 0.2}s`}}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-12 px-4">
            <p className="text-gray-600 mb-4">🎯 All plans include free delivery and 24/7 support</p>
            <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                No commitment
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Cancel anytime
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                Money-back guarantee
              </div>
            </div>
          </div>
        </div>
        

      </div>

      {/* Native Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
        {/* Home Indicator */}
        <div className="flex justify-center pt-1">
          <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-semibold text-gray-800">Free delivery</p>
              </div>
              <p className="text-xs text-gray-500">⚡ 25 min delivery to campus</p>
            </div>
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(50);
                handleOrderNow();
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform active:scale-95 shadow-lg flex items-center"
            >
              <span className="text-lg mr-2">🍽️</span>
              Order Now
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default HomePage;
