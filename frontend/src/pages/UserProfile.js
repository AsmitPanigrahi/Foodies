import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AddressManager from '../components/profile/AddressManager';
import toast from 'react-hot-toast';
import useForm from '../hooks/useForm';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const { values, errors, handleChange, handleBlur, validateForm, setValues } = useForm(
    {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    {
      name: [{ type: 'required' }, { type: 'length', min: 2, max: 50 }],
      phone: [{ type: 'phone' }],
    }
  );

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setValues(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(values).forEach(key => formData.append(key, values[key]));
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const response = await userAPI.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <Button
                variant={isEditing ? "secondary" : "primary"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={avatar ? URL.createObjectURL(avatar) : user?.avatar || 'https://via.placeholder.com/100'}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </label>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    disabled={!isEditing}
                    required
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={values.email}
                    disabled={true}
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.phone}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={loading}
                      className="ml-3"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Address Management Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <AddressManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
