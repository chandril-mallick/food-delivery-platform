// pages/AccountSettingsPage.jsx
import React from 'react';
import AccountSettings from '../components/AccountSettings';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AccountSettingsPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AccountSettings />
    </div>
  );
};

export default AccountSettingsPage;
