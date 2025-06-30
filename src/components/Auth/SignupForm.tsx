import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { User } from '../../types';
import { GraduationCap, Mail, Lock, User as UserIcon, Phone, Building, ArrowLeft, UserPlus, Crown, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SignupFormProps {
  onBackToLogin: () => void;
}

export function SignupForm({ onBackToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    role: 'faculty' as 'faculty' | 'hod'
  });
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const departments = ['BBA', 'BCA', 'BCOM', 'MCOM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.department || !formData.role) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      const userData: User = {
        id: userCredential.user.uid,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        isApproved: false, // All new accounts need admin approval
        registrationDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Show approval confirmation modal
      setShowApprovalModal(true);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleApprovalModalClose = () => {
    setShowApprovalModal(false);
    onBackToLogin(); // This redirects to login page
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 overflow-y-auto">
        <div className="max-w-md w-full my-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-[#002e5d] p-3 rounded-full animate-pulse">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Faculty Management</h1>
              <p className="text-gray-600">Create your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange('name')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.department}
                    onChange={handleChange('department')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Crown className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={handleChange('role')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    required
                  >
                    <option value="faculty">Faculty</option>
                    <option value="hod">Head of Department (HOD)</option>
                  </select>
                </div>
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onBackToLogin}
                className="text-[#002e5d] hover:text-blue-800 font-medium flex items-center justify-center space-x-2 mx-auto transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 transform transition-all duration-300 my-8 form-container">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Created Successfully!</h3>
              
              <div className="text-sm text-gray-600 mb-6 space-y-4 overflow-y-auto max-h-96">
                <p className="text-base">Your {formData.role === 'hod' ? 'HOD' : 'faculty'} account has been created and is now pending admin approval.</p>
                
                {/* Approval Process Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                      <div className="space-y-2 text-blue-800">
                        <div className="flex items-start space-x-2">
                          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">Your account is now in the admin approval queue</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">Admin will review your {formData.role === 'hod' ? 'HOD' : 'faculty'} credentials and department information</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">You'll receive an email notification once approved</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">After approval, you can login and access all {formData.role === 'hod' ? 'HOD' : 'faculty'} features</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role-specific information */}
                {formData.role === 'hod' ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
                    <div className="flex items-start space-x-3">
                      <Crown className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-1">HOD Account Features</h4>
                        <p className="text-xs text-purple-800">
                          As an HOD, you'll have access to department management, faculty oversight, 
                          leave approvals, and advanced reporting features once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                    <div className="flex items-start space-x-3">
                      <UserIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">Faculty Account Features</h4>
                        <p className="text-xs text-green-800">
                          As faculty, you'll have access to attendance marking, timetable management, 
                          leave applications, and achievement tracking once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-3">
                  Approval typically takes 24-48 hours. You can try logging in after receiving approval confirmation.
                </p>
              </div>

              <button
                onClick={handleApprovalModalClose}
                className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}