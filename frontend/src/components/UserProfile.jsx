import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Edit3, 
  Save, 
  X, 

  Settings, 
  Shield, 
  Bell, 
  Heart, 
  Award,
  
  Check,
  AlertCircle,
  
} from 'lucide-react';

const UserProfile = () => {
  const { user, userProfile, updateProfile, loading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  // Password fields UI has been removed; toggle state not needed
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    dietary: '',
    interests: '',
    occupation: '',
    website: '',
    emergencyContact: '',
    profileImage: ''
  });
  const [errors, setErrors] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Profile Complete', description: 'Completed your profile', earned: false },
    { id: 2, title: 'First Login', description: 'Welcome to the platform', earned: true },
    { id: 3, title: 'Social Butterfly', description: 'Connected with 10 people', earned: false }
  ]);

  useEffect(() => {
    // Initialize dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  useEffect(() => {
    // Populate form when profile is available
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || userProfile.phoneNumber || '',
        address: userProfile.address || '',
        bio: userProfile.bio || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        dietary: Array.isArray(userProfile.dietary) ? userProfile.dietary.join(', ') : (userProfile.dietary || ''),
        interests: Array.isArray(userProfile.interests) ? userProfile.interests.join(', ') : (userProfile.interests || ''),
        occupation: userProfile.occupation || '',
        website: userProfile.website || '',
        emergencyContact: userProfile.emergencyContact || '',
        profileImage: userProfile.profileImage || ''
      });
    }
  }, [userProfile]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must be a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const updatedData = {
        ...formData,
        dietary: formData.dietary.split(',').map(item => item.trim()).filter(item => item),
        interests: formData.interests.split(',').map(item => item.trim()).filter(item => item),
        lastUpdated: new Date().toISOString()
      };
      const result = await updateProfile(updatedData);
      if (!result?.success) throw new Error(result?.error || 'Failed to update profile');
      // Optimistic UI
      // userProfile comes from context and will be refreshed there; still reflect immediately
      setEditMode(false);
      
      // Check for profile completion achievement
      const isComplete = Object.values(formData).every(value => value.trim() !== '');
      if (isComplete) {
        setAchievements(prev => prev.map(ach => 
          ach.id === 1 ? { ...ach, earned: true } : ach
        ));
      }
      
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      const msg = error?.message ? `Failed to update profile: ${error.message}` : 'Failed to update profile';
      addNotification(msg, 'error');
    }
  };

  const addNotification = (message, type) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const profileCompleteness = () => {
    const fields = Object.values(formData);
    const completed = fields.filter(field => field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">User not logged in</h2>
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const themeClasses = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors duration-300`}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 max-w-sm ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={`${cardClasses} border-b sticky top-0 z-40`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">My Profile</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${cardClasses} rounded-xl border p-6 sticky top-24`}>
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      formData.name.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-lg mt-3">{formData.name || 'User'}</h3>
                <p className="text-gray-500 text-sm">{formData.occupation || 'Add occupation'}</p>
              </div>

              {/* Profile Completion */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm text-blue-500">{profileCompleteness()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompleteness()}%` }}
                  ></div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'achievements', label: 'Achievements', icon: Award },
                  { id: 'settings', label: 'Settings', icon: Settings },
                  { id: 'privacy', label: 'Privacy', icon: Shield }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === id 
                        ? 'bg-blue-500 text-white' 
                        : `hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className={`${cardClasses} rounded-xl border p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Profile Information</h2>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { name: 'name', label: 'Full Name', type: 'text', icon: User, required: true },
                        { name: 'email', label: 'Email Address', type: 'email', icon: Mail, required: true },
                        { name: 'phone', label: 'Phone Number', type: 'tel', icon: Phone },
                        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', icon: Calendar },
                        { name: 'occupation', label: 'Occupation', type: 'text', icon: User },
                        { name: 'website', label: 'Website', type: 'url', icon: User }
                      ].map(({ name, label, type, icon: Icon, required }) => (
                        <div key={name}>
                          <label className="block text-sm font-medium mb-2">
                            {label} {required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                              type={type}
                              name={name}
                              value={formData[name]}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputClasses} ${
                                errors[name] ? 'border-red-500' : 'focus:border-blue-500'
                              } focus:ring-2 focus:ring-blue-200 transition-colors`}
                              placeholder={`Enter your ${label.toLowerCase()}`}
                            />
                          </div>
                          {errors[name] && (
                            <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputClasses} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border ${inputClasses} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none`}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Dietary Preferences <span className="text-gray-500">(comma-separated)</span>
                        </label>
                        <input
                          type="text"
                          name="dietary"
                          value={formData.dietary}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${inputClasses} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                          placeholder="e.g. Vegetarian, Gluten-Free, Vegan"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Interests <span className="text-gray-500">(comma-separated)</span>
                        </label>
                        <input
                          type="text"
                          name="interests"
                          value={formData.interests}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${inputClasses} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                          placeholder="e.g. Reading, Photography, Travel"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${inputClasses} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                        placeholder="Emergency contact name and phone"
                      />
                    </div>

                    <div className="flex space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setErrors({});
                        }}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <X className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Name', value: user.name, icon: User },
                        { label: 'Email', value: user.email, icon: Mail },
                        { label: 'Phone', value: user.phone, icon: Phone },
                        { label: 'Date of Birth', value: user.dateOfBirth, icon: Calendar },
                        { label: 'Occupation', value: user.occupation, icon: User },
                        { label: 'Website', value: user.website, icon: User }
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">{label}</p>
                            <p className="font-medium">{value || 'Not provided'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Address */}
                    {user.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="font-medium">{user.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {user.bio && (
                      <div>
                        <h3 className="font-medium mb-2">About Me</h3>
                        <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="space-y-4">
                      {user.dietary && Array.isArray(user.dietary) && user.dietary.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Heart className="h-4 w-4 mr-2 text-red-500" />
                            Dietary Preferences
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {user.dietary.map((diet, i) => (
                              <span key={i} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                {diet}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {user.interests && Array.isArray(user.interests) && user.interests.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Interests</h4>
                          <div className="flex flex-wrap gap-2">
                            {user.interests.map((interest, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className={`${cardClasses} rounded-xl border p-6`}>
                <h2 className="text-2xl font-bold mb-6">Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.earned 
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          achievement.earned ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          <Award className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.earned && (
                            <span className="text-xs text-yellow-600 font-medium">Earned!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={`${cardClasses} rounded-xl border p-6`}>
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-gray-500">Toggle dark/light theme</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive email updates</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className={`${cardClasses} rounded-xl border p-6`}>
                <h2 className="text-2xl font-bold mb-6">Privacy & Security</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Your data is secure</h3>
                        <p className="text-sm text-gray-600">We use industry-standard encryption to protect your information.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <h3 className="font-medium">Change Password</h3>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </button>
                    
                    <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <h3 className="font-medium">Privacy Settings</h3>
                      <p className="text-sm text-gray-500">Control who can see your information</p>
                    </button>
                    
                    <button className="w-full text-left p-4 border rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600">
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-red-500">Permanently delete your account and data</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;