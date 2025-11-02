// components/Checkout.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import OrderService, { PAYMENT_METHODS } from '../services/orderService';
import { toast } from 'react-hot-toast';

const Checkout = ({ userId, onOrderSuccess }) => {
  const { cartItems, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [deliveryType, setDeliveryType] = useState('regular'); // 'regular' or 'university'
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [universityLocation, setUniversityLocation] = useState('');
  const [universityDetails, setUniversityDetails] = useState({
    department: '',
    buildingNumber: '',
    roomNumber: '',
    area: ''
  });
  
  // University options
  const universities = [
    {
      id: 'BWU',
      name: 'BRAINWARE UNIVERSITY',
      locations: [' Main Campus']
    },
   
  ];
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState({});

  // Calculate pricing - University delivery is always free
  const deliveryFee = 0; // Free delivery for all
  const platformFee = 2.5; // Platform fee
  const total = subtotal + deliveryFee + platformFee; // Subtotal + delivery fee + platform fee

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (deliveryType === 'university') {
      // Validate university delivery
      if (!selectedUniversity) newErrors.university = 'Please select a university';
      if (!universityLocation) newErrors.location = 'Please select a location';
      if (!universityDetails.department.trim()) newErrors.department = 'Department is required';
      if (!universityDetails.buildingNumber.trim()) newErrors.buildingNumber = 'Building number is required';
    } else {
      // Validate regular delivery address
      if (!deliveryAddress.street.trim()) newErrors.street = 'Street address is required';
      if (!deliveryAddress.city.trim()) newErrors.city = 'City is required';
      if (!deliveryAddress.state.trim()) newErrors.state = 'State is required';
      if (!deliveryAddress.pincode.trim()) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }
    }

    // Validate customer name
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    // Validate contact number
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const finalDeliveryAddress = deliveryType === 'university' 
        ? {
            street: `${universities.find(u => u.id === selectedUniversity)?.name} - ${universityLocation}`,
            city: 'Barasat',
            state: 'West Bengal',
            pincode: '700124',
            landmark: `${universityDetails.department}, Building ${universityDetails.buildingNumber}${universityDetails.roomNumber ? ', Room ' + universityDetails.roomNumber : ''}${universityDetails.area ? ', ' + universityDetails.area : ''}`,
            type: 'university',
            university: selectedUniversity,
            location: universityLocation,
            universityDetails
          }
        : { ...deliveryAddress, type: 'regular' };

      const orderData = {
        userId,
        customerName: customerName.trim(),
        items: cartItems,
        deliveryAddress: finalDeliveryAddress,
        paymentMethod,
        specialInstructions,
        contactNumber: contactNumber.replace(/\s/g, ''),
        deliveryType
      };

      const result = await OrderService.placeOrder(orderData);
      
      if (result.success) {
        toast.success(result.message);
        clearCart(); // Clear cart
        
        // Call success callback with order details
        if (onOrderSuccess) {
          onOrderSuccess(result);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactChange = (value) => {
    // Allow only numbers
    const numbersOnly = value.replace(/\D/g, '');
    setContactNumber(numbersOnly);
    if (errors.contactNumber) {
      setErrors(prev => ({ ...prev, contactNumber: '' }));
    }
  };


  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
    setSelectedUniversity('');
    setUniversityLocation('');
    setUniversityDetails({
      department: '',
      buildingNumber: '',
      roomNumber: '',
      area: ''
    });
    // Clear errors when switching delivery types
    setErrors(prev => ({ 
      ...prev, 
      university: '', 
      location: '', 
      department: '',
      buildingNumber: '',
      roomNumber: '',
      area: '',
      street: '', 
      city: '', 
      state: '', 
      pincode: '' 
    }));
  };

  const handleUniversityChange = (universityId) => {
    setSelectedUniversity(universityId);
    setUniversityLocation(''); // Reset location when university changes
    setUniversityDetails({
      department: '',
      buildingNumber: '',
      roomNumber: '',
      area: ''
    });
    if (errors.university) {
      setErrors(prev => ({ ...prev, university: '' }));
    }
  };

  const handleLocationChange = (location) => {
    setUniversityLocation(location);
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const handleUniversityDetailChange = (field, value) => {
    setUniversityDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-100 min-h-screen flex items-center justify-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-300">Add some delicious items to your cart first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100 relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <h2 className="text-3xl font-bold text-white mb-8">Checkout</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Delivery Type Selection */}
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Delivery Options</h3>
              
              {/* Delivery Type Tabs */}
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleDeliveryTypeChange('university')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                    deliveryType === 'university'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                      : 'border-white/10 bg-white/5 text-gray-200 hover:border-white/20'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎓</div>
                    <div className="font-semibold">University Delivery</div>
                    <div className="text-sm text-gray-300">Free delivery to campus</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleDeliveryTypeChange('regular')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                    deliveryType === 'regular'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                      : 'border-white/10 bg-white/5 text-gray-200 hover:border-white/20'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏠</div>
                    <div className="font-semibold">Regular Delivery</div>
                    <div className="text-sm text-gray-300">Deliver to any address</div>
                  </div>
                </button>
              </div>

              {/* University Delivery Form */}
              {deliveryType === 'university' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎓</span>
                      <h4 className="font-semibold text-green-300">University Delivery - FREE!</h4>
                    </div>
                    <p className="text-sm text-green-300">
                      Get your food delivered directly to your university campus with zero delivery charges!
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select University *
                    </label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => handleUniversityChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.university ? 'border-red-500' : 'border-white/10'
                      }`}
                    >
                      <option value="">Choose your university...</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                      ))}
                    </select>
                    {errors.university && <p className="text-red-400 text-sm mt-1">{errors.university}</p>}
                  </div>

                  {selectedUniversity && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Select Campus Location *
                        </label>
                        <select
                          value={universityLocation}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.location ? 'border-red-500' : 'border-white/10'
                          }`}
                        >
                          <option value="">Choose location...</option>
                          {universities.find(u => u.id === selectedUniversity)?.locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                        {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                      </div>
                      
                      {/* Additional University Details */}
                      {universityLocation && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">📍</span>
                            <h4 className="font-semibold text-blue-300">Delivery Details</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Department/Faculty *
                              </label>
                              <input
                                type="text"
                                value={universityDetails.department}
                                onChange={(e) => handleUniversityDetailChange('department', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                  errors.department ? 'border-red-500' : 'border-white/10'
                                }`}
                                placeholder="e.g., Computer Science, Library, Hostel"
                              />
                              {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Building Number *
                              </label>
                              <input
                                type="text"
                                value={universityDetails.buildingNumber}
                                onChange={(e) => handleUniversityDetailChange('buildingNumber', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                  errors.buildingNumber ? 'border-red-500' : 'border-white/10'
                                }`}
                                placeholder="e.g., Block A, Building 1, Main Block"
                              />
                              {errors.buildingNumber && <p className="text-red-400 text-sm mt-1">{errors.buildingNumber}</p>}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Room Number
                              </label>
                              <input
                                type="text"
                                value={universityDetails.roomNumber}
                                onChange={(e) => handleUniversityDetailChange('roomNumber', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 border-white/10"
                                placeholder="e.g., 201, Lab 3, Reception (Optional)"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Specific Area/Landmark
                              </label>
                              <input
                                type="text"
                                value={universityDetails.area}
                                onChange={(e) => handleUniversityDetailChange('area', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 border-white/10"
                                placeholder="e.g., Near Gate 2, Canteen Area (Optional)"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                            <p className="text-sm text-yellow-300">
                              📞 <strong>Tip:</strong> Please provide clear details to help our delivery partner find you easily on campus.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Regular Delivery Form */}
              {deliveryType === 'regular' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.street ? 'border-red-500' : 'border-white/10'
                      }`}
                      placeholder="Enter your street address"
                    />
                    {errors.street && <p className="text-red-400 text-sm mt-1">{errors.street}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.city ? 'border-red-500' : 'border-white/10'
                        }`}
                        placeholder="City"
                      />
                      {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.state ? 'border-red-500' : 'border-white/10'
                        }`}
                        placeholder="State"
                      />
                      {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.pincode}
                        onChange={(e) => handleAddressChange('pincode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.pincode ? 'border-red-500' : 'border-white/10'
                        }`}
                        placeholder="123456"
                        maxLength="6"
                      />
                      {errors.pincode && <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.landmark}
                        onChange={(e) => handleAddressChange('landmark', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 border-white/10"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Contact Information */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/10">
                <h2 className="text-lg font-medium text-white mb-4">Contact Information</h2>
                <div className="mb-4">
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="customerName"
                      className={`w-full px-3 py-2 border ${errors.customerName ? 'border-red-500' : 'border-white/10'} rounded-md shadow-sm bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    {errors.customerName && <p className="mt-1 text-sm text-red-400">{errors.customerName}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="contactNumber"
                      className={`w-full px-3 py-2 border ${errors.contactNumber ? 'border-red-500' : 'border-white/10'} rounded-md shadow-sm bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Enter 10-digit mobile number"
                      value={contactNumber}
                      onChange={(e) => handleContactChange(e.target.value)}
                      maxLength="10"
                    />
                    {errors.contactNumber && <p className="mt-1 text-sm text-red-400">{errors.contactNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Payment Method</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PAYMENT_METHODS.COD}
                      checked={paymentMethod === PAYMENT_METHODS.COD}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-orange-500"
                    />
                    <span className="text-gray-300">Cash on Delivery (COD)</span>
                  </label>
                  
                  <label className="flex items-center opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PAYMENT_METHODS.ONLINE}
                      disabled
                      className="mr-3"
                    />
                    <span className="text-gray-400">Online Payment (Coming Soon)</span>
                  </label>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Special Instructions</h3>
                
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 border-white/10"
                  rows="3"
                  placeholder="Any special requests or instructions for your order..."
                />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-md sticky top-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{item.name}</h4>
                      <p className="text-sm text-gray-300">₹{item.price} × {item.qty}</p>
                    </div>
                    <span className="font-medium text-white">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-white/10" />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300">Delivery Fee</span>
                  </div>
                  <span className="text-green-300 font-medium">Free delivery</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-gray-300">Platform Fee</span>
                  </div>
                  <span className="font-medium text-white">₹2.5</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-gray-300">Taxes & Fees</span>
                  </div>
                  <span className="text-gray-400">No taxes</span>
                </div>
                
                <hr className="my-2 border-white/10" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-300">₹{total}</span>
                </div>
              </div>

              {/* University Delivery Info */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <p className="text-sm text-blue-300">
                  🚚 Free delivery within university campus • ₹2 developer fee included
                </p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ₹${total}`
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Estimated delivery time: 20-30 minutes (University Campus)
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Checkout;