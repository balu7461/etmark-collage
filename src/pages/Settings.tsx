import React, { useState } from 'react';
import { Header } from '../components/Layout/Header';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Mail, Phone, User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });
  const [emailSettings, setEmailSettings] = useState({
    morningTime: '09:00',
    eveningTime: '17:00',
    enableParentNotifications: true,
    enableFacultyNotifications: true
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would update the user profile in Firebase
    toast.success('Profile updated successfully!');
  };

  const handleEmailSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would update the email settings in Firebase
    toast.success('Email settings updated successfully!');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and system preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-[#002e5d]" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#002e5d] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </button>
              </form>
            </div>

            {/* Email Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-6 w-6 text-[#002e5d]" />
                <h2 className="text-xl font-semibold text-gray-900">Email Notification Settings</h2>
              </div>

              <form onSubmit={handleEmailSettingsUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Morning Report Time
                    </label>
                    <input
                      type="time"
                      value={emailSettings.morningTime}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, morningTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Send morning absence notifications at this time</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evening Report Time
                    </label>
                    <input
                      type="time"
                      value={emailSettings.eveningTime}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, eveningTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Send evening absence notifications at this time</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="parentNotifications"
                      checked={emailSettings.enableParentNotifications}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, enableParentNotifications: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="parentNotifications" className="ml-2 block text-sm text-gray-900">
                      Enable parent notifications for student absences
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="facultyNotifications"
                      checked={emailSettings.enableFacultyNotifications}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, enableFacultyNotifications: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="facultyNotifications" className="ml-2 block text-sm text-gray-900">
                      Enable faculty notifications for leave status updates
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#002e5d] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Email Settings</span>
                </button>
              </form>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <SettingsIcon className="h-6 w-6 text-[#002e5d]" />
                <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Email Configuration</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>From Email:</strong> hiddencave168@gmail.com</p>
                    <p><strong>Service:</strong> EmailJS</p>
                    <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Database</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Provider:</strong> Firebase Firestore</p>
                    <p><strong>Region:</strong> US Central</p>
                    <p><strong>Status:</strong> <span className="text-green-600">Connected</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Features Enabled</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Student Attendance Tracking</p>
                    <p>• Faculty Leave Management</p>
                    <p>• Achievement Tracking</p>
                    <p>• Excel Report Export</p>
                    <p>• Automated Email Notifications</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">User Role</h3>
                  <div className="text-sm text-gray-600">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {currentUser?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}