// components/ProfilePictureUpload.jsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePictureUpload = ({ currentImage, onImageUpdate, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    uploadImage(file);
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);

      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload to Firebase Storage or another service
      // For now, we'll simulate the upload and use the base64 data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload delay

      const reader2 = new FileReader();
      reader2.onload = (e) => {
        const imageData = e.target.result;
        onImageUpdate(imageData);
        toast.success('Profile picture updated successfully!');
      };
      reader2.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      setPreviewImage(currentImage); // Reset to original
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageUpdate(null);
    toast.success('Profile picture removed');
  };

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-100">
              <User className="w-12 h-12 text-orange-400" />
            </div>
          )}
        </div>

        {/* Upload/Camera Button */}
        {!disabled && (
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Remove Button */}
        {previewImage && !disabled && (
          <button
            onClick={handleRemoveImage}
            className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upload Instructions */}
      {!disabled && (
        <div className="text-center">
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Change Picture'}</span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUpload;
