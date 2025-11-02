// components/PaymentMethodManager.jsx
import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Shield, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentMethodManager = ({ paymentMethods = [], onUpdate, disabled = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const [newMethod, setNewMethod] = useState({
    type: 'card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    nickname: '',
    upiId: '',
    walletType: 'paytm'
  });

  const cardTypes = [
    { value: 'visa', label: 'Visa', color: 'bg-blue-600' },
    { value: 'mastercard', label: 'Mastercard', color: 'bg-red-600' },
    { value: 'rupay', label: 'RuPay', color: 'bg-green-600' },
    { value: 'amex', label: 'American Express', color: 'bg-purple-600' }
  ];

  const walletTypes = [
    { value: 'paytm', label: 'Paytm' },
    { value: 'phonepe', label: 'PhonePe' },
    { value: 'googlepay', label: 'Google Pay' },
    { value: 'amazonpay', label: 'Amazon Pay' }
  ];

  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('6')) return 'rupay';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const formatCardNumber = (value) => {
    const number = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = number.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return number;
    }
  };

  const handleAddMethod = () => {
    // Validation
    if (newMethod.type === 'card') {
      if (!newMethod.cardNumber || !newMethod.expiryMonth || !newMethod.expiryYear || !newMethod.cvv || !newMethod.holderName) {
        toast.error('Please fill all card details');
        return;
      }
      if (newMethod.cardNumber.replace(/\s/g, '').length < 13) {
        toast.error('Please enter a valid card number');
        return;
      }
    } else if (newMethod.type === 'upi') {
      if (!newMethod.upiId) {
        toast.error('Please enter UPI ID');
        return;
      }
      if (!newMethod.upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return;
      }
    }

    const methodToAdd = {
      id: Date.now().toString(),
      ...newMethod,
      isDefault: paymentMethods.length === 0,
      createdAt: new Date().toISOString()
    };

    if (newMethod.type === 'card') {
      methodToAdd.cardType = detectCardType(newMethod.cardNumber);
      methodToAdd.lastFour = newMethod.cardNumber.slice(-4);
    }

    onUpdate([...paymentMethods, methodToAdd]);
    
    // Reset form
    setNewMethod({
      type: 'card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      nickname: '',
      upiId: '',
      walletType: 'paytm'
    });
    setShowAddForm(false);
    toast.success('Payment method added successfully!');
  };

  const handleRemoveMethod = (methodId) => {
    const confirmed = window.confirm('Are you sure you want to remove this payment method?');
    if (confirmed) {
      const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
      // If we removed the default method, make the first remaining method default
      if (updatedMethods.length > 0 && !updatedMethods.some(method => method.isDefault)) {
        updatedMethods[0].isDefault = true;
      }
      onUpdate(updatedMethods);
      toast.success('Payment method removed');
    }
  };

  const handleSetDefault = (methodId) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId
    }));
    onUpdate(updatedMethods);
    toast.success('Default payment method updated');
  };

  const getCardIcon = (cardType) => {
    const type = cardTypes.find(t => t.value === cardType);
    return type ? type.color : 'bg-gray-600';
  };

  const renderPaymentMethod = (method) => {
    return (
      <div key={method.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-6 rounded ${getCardIcon(method.cardType)} flex items-center justify-center`}>
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            
            <div>
              {method.type === 'card' && (
                <>
                  <p className="font-medium text-gray-800">
                    {method.nickname || `${method.cardType?.toUpperCase()} Card`}
                  </p>
                  <p className="text-sm text-gray-600">
                    **** **** **** {method.lastFour}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </>
              )}
              
              {method.type === 'upi' && (
                <>
                  <p className="font-medium text-gray-800">UPI</p>
                  <p className="text-sm text-gray-600">{method.upiId}</p>
                </>
              )}
              
              {method.type === 'wallet' && (
                <>
                  <p className="font-medium text-gray-800">
                    {walletTypes.find(w => w.value === method.walletType)?.label} Wallet
                  </p>
                  <p className="text-sm text-gray-600">Digital Wallet</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {method.isDefault && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Default
              </span>
            )}
            
            {!disabled && (
              <div className="flex space-x-1">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-xs text-orange-600 hover:text-orange-800 px-2 py-1 rounded"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleRemoveMethod(method.id)}
                  className="text-xs text-red-600 hover:text-red-800 p-1 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
        {!disabled && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-3 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Method
          </button>
        )}
      </div>

      {/* Payment Methods List */}
      <div className="space-y-3 mb-6">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No payment methods added yet</p>
          </div>
        ) : (
          paymentMethods.map(renderPaymentMethod)
        )}
      </div>

      {/* Add Payment Method Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-800 mb-4">Add New Payment Method</h4>
          
          {/* Payment Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={newMethod.type === 'card'}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, type: e.target.value }))}
                  className="mr-2"
                />
                Credit/Debit Card
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="upi"
                  checked={newMethod.type === 'upi'}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, type: e.target.value }))}
                  className="mr-2"
                />
                UPI
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="wallet"
                  checked={newMethod.type === 'wallet'}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, type: e.target.value }))}
                  className="mr-2"
                />
                Digital Wallet
              </label>
            </div>
          </div>

          {/* Card Details */}
          {newMethod.type === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number *
                </label>
                <input
                  type="text"
                  value={newMethod.cardNumber}
                  onChange={(e) => setNewMethod(prev => ({ 
                    ...prev, 
                    cardNumber: formatCardNumber(e.target.value) 
                  }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  value={newMethod.holderName}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, holderName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={newMethod.nickname}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="My Primary Card"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Month *
                </label>
                <select
                  value={newMethod.expiryMonth}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Year *
                </label>
                <select
                  value={newMethod.expiryYear}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="password"
                  value={newMethod.cvv}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                  placeholder="123"
                  maxLength="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* UPI Details */}
          {newMethod.type === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID *
              </label>
              <input
                type="text"
                value={newMethod.upiId}
                onChange={(e) => setNewMethod(prev => ({ ...prev, upiId: e.target.value }))}
                placeholder="yourname@paytm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Wallet Details */}
          {newMethod.type === 'wallet' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Type
              </label>
              <select
                value={newMethod.walletType}
                onChange={(e) => setNewMethod(prev => ({ ...prev, walletType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {walletTypes.map(wallet => (
                  <option key={wallet.value} value={wallet.value}>
                    {wallet.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and stored securely. We never store your CVV.</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleAddMethod}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Add Payment Method
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;
