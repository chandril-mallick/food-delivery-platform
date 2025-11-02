// components/OrderPreferences.jsx
import React, { useState } from 'react';
import { Clock, Bell, Utensils, Heart, Star } from 'lucide-react';

const OrderPreferences = ({ preferences = {}, onUpdate, disabled = false }) => {
  const [localPreferences, setLocalPreferences] = useState({
    defaultDeliveryTime: 'asap',
    preferredCuisines: [],
    dietaryRestrictions: [],
    spiceLevel: 'medium',
    autoReorder: false,
    notifications: {
      orderConfirmation: true,
      preparationUpdates: true,
      deliveryUpdates: true,
      promotions: false
    },
    deliveryInstructions: '',
    favoriteRestaurants: [],
    budgetRange: {
      min: 0,
      max: 1000
    },
    ...preferences
  });

  const deliveryTimeOptions = [
    { value: 'asap', label: 'As Soon As Possible', description: 'Get your food delivered at the earliest' },
    { value: '30min', label: '30 Minutes', description: 'Standard delivery time' },
    { value: '1hour', label: '1 Hour', description: 'Flexible delivery time' },
    { value: 'schedule', label: 'Schedule Later', description: 'Choose specific delivery time' }
  ];

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 
    'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Lebanese', 'Continental'
  ];

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { value: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
    { value: 'nut-free', label: 'Nut-Free', icon: '🥜' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'low-carb', label: 'Low-Carb', icon: '🥒' },
    { value: 'halal', label: 'Halal', icon: '☪️' },
    { value: 'jain', label: 'Jain', icon: '🙏' }
  ];

  const spiceLevels = [
    { value: 'mild', label: 'Mild', color: 'bg-green-100 text-green-800', icon: '🌶️' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🌶️🌶️' },
    { value: 'hot', label: 'Hot', color: 'bg-orange-100 text-orange-800', icon: '🌶️🌶️🌶️' },
    { value: 'extra-hot', label: 'Extra Hot', color: 'bg-red-100 text-red-800', icon: '🌶️🌶️🌶️🌶️' }
  ];

  const handlePreferenceChange = (key, value) => {
    const updated = { ...localPreferences, [key]: value };
    setLocalPreferences(updated);
    if (!disabled) {
      onUpdate(updated);
    }
  };

  const handleArrayToggle = (key, value) => {
    const currentArray = localPreferences[key] || [];
    const updated = {
      ...localPreferences,
      [key]: currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
    };
    setLocalPreferences(updated);
    if (!disabled) {
      onUpdate(updated);
    }
  };

  const handleNotificationChange = (key, value) => {
    const updated = {
      ...localPreferences,
      notifications: {
        ...localPreferences.notifications,
        [key]: value
      }
    };
    setLocalPreferences(updated);
    if (!disabled) {
      onUpdate(updated);
    }
  };

  const handleBudgetChange = (type, value) => {
    const updated = {
      ...localPreferences,
      budgetRange: {
        ...localPreferences.budgetRange,
        [type]: parseInt(value) || 0
      }
    };
    setLocalPreferences(updated);
    if (!disabled) {
      onUpdate(updated);
    }
  };

  return (
    <div className="space-y-8">
      {/* Delivery Preferences */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Delivery Preferences</h3>
        </div>
        
        <div className="space-y-4 pl-7">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Default Delivery Time
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deliveryTimeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    localPreferences.defaultDeliveryTime === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={localPreferences.defaultDeliveryTime === option.value}
                    onChange={(e) => handlePreferenceChange('defaultDeliveryTime', e.target.value)}
                    disabled={disabled}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Delivery Instructions
            </label>
            <textarea
              value={localPreferences.deliveryInstructions}
              onChange={(e) => handlePreferenceChange('deliveryInstructions', e.target.value)}
              disabled={disabled}
              placeholder="e.g., Leave at door, Ring doorbell, Call on arrival..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Food Preferences */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Utensils className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Food Preferences</h3>
        </div>
        
        <div className="space-y-6 pl-7">
          {/* Preferred Cuisines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Cuisines
            </label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleArrayToggle('preferredCuisines', cuisine)}
                  disabled={disabled}
                  className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                    localPreferences.preferredCuisines?.includes(cuisine)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    localPreferences.dietaryRestrictions?.includes(option.value)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={localPreferences.dietaryRestrictions?.includes(option.value)}
                    onChange={() => handleArrayToggle('dietaryRestrictions', option.value)}
                    disabled={disabled}
                    className="mr-3"
                  />
                  <span className="mr-2">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Spice Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Spice Level
            </label>
            <div className="flex flex-wrap gap-3">
              {spiceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handlePreferenceChange('spiceLevel', level.value)}
                  disabled={disabled}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    localPreferences.spiceLevel === level.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="mr-2">{level.icon}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${level.color}`}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Preferences */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Budget Preferences</h3>
        </div>
        
        <div className="pl-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Budget (₹)
              </label>
              <input
                type="number"
                value={localPreferences.budgetRange?.min || 0}
                onChange={(e) => handleBudgetChange('min', e.target.value)}
                disabled={disabled}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Budget (₹)
              </label>
              <input
                type="number"
                value={localPreferences.budgetRange?.max || 1000}
                onChange={(e) => handleBudgetChange('max', e.target.value)}
                disabled={disabled}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>₹{localPreferences.budgetRange?.min || 0}</span>
              <span>₹{localPreferences.budgetRange?.max || 1000}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full"
                style={{ 
                  width: `${((localPreferences.budgetRange?.max || 1000) / 2000) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Order Notifications</h3>
        </div>
        
        <div className="space-y-3 pl-7">
          {Object.entries({
            orderConfirmation: 'Order Confirmation',
            preparationUpdates: 'Food Preparation Updates',
            deliveryUpdates: 'Delivery Status Updates',
            promotions: 'Promotional Offers'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.notifications?.[key] || false}
                  onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Reorder */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Convenience Features</h3>
        </div>
        
        <div className="pl-7">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Auto-Reorder Favorites</p>
              <p className="text-sm text-gray-600">
                Automatically suggest reordering your frequently ordered items
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.autoReorder || false}
                onChange={(e) => handlePreferenceChange('autoReorder', e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPreferences;
