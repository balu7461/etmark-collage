import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { User, Department } from '../../types';
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
    role: 'faculty' as 'faculty' | 'timetable_committee' | 'examination_committee' | 'achievements_committee'
  });
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.role) {
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'Faculty';
      case 'committee_member':
        return 'Committee Member';
      case 'timetable_committee':
        return 'Timetable Committee';
      case 'examination_committee':
        return 'Examination Committee';
      case 'achievements_committee':
        return 'Achievements Committee';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="max-w-md w-full my-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-[#002e5d] p-3 rounded-full animate-pulse">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Join Faculty Management</h1>
              <p className="text-sm lg:text-base text-gray-600">Create your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-[#002e5d]" />
                    <span>Full Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-[#002e5d]" />
                    <span>Email Address</span>
                  </div>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-[#002e5d]" />
                    <span>Phone Number</span>
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-[#002e5d]" />
                    <span>Role</span>
                  </div>
                </label>
                <select
                  value={formData.role}
                  onChange={handleChange('role')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="faculty">Faculty</option>
                  <option value="timetable_committee">Timetable Committee</option>
                  <option value="examination_committee">Examination Committee</option>
                  <option value="achievements_committee">Achievements Committee</option>
                </select>
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-[#002e5d]" />
                    <span>Password</span>
                  </div>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div className="transform transition-all duration-200 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-[#002e5d]" />
                    <span>Confirm Password</span>
                  </div>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Role-specific information */}
              {(formData.role === 'timetable_committee' || formData.role === 'examination_committee' || formData.role === 'achievements_committee') && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        {getRoleDisplayName(formData.role)} Account
                      </h4>
                      <p className="text-sm text-blue-800">
                        {formData.role === 'timetable_committee' 
                          ? 'Timetable Committee members can review leave applications and manage timetables.'
                          : formData.role === 'examination_committee'
                          ? 'Examination Committee members can review leave applications and manage examination schedules.'
                          : formData.role === 'achievements_committee'
                          ? 'Achievements Committee members can manage student achievements and recognition programs.'
                          : 'Committee members have special privileges and can review leave applications.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-xl hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm lg:text-base min-h-[44px]"
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
                className="flex items-center justify-center space-x-2 text-[#002e5d] hover:text-blue-800 transition-colors duration-200 text-sm lg:text-base min-h-[44px] px-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 lg:p-8 transform transition-all duration-300">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Account Created Successfully!</h3>
              <p className="text-sm lg:text-base text-gray-600 mb-6">
                Your {getRoleDisplayName(formData.role).toLowerCase()} account has been created and is pending admin approval.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Approval Required</h4>
                    <p className="text-xs lg:text-sm text-blue-800">
                      {formData.role === 'timetable_committee' || formData.role === 'examination_committee'
                        ? 'Committee accounts require special verification. You will be notified once approved.'
                        : formData.role === 'achievements_committee'
                        ? 'Achievements Committee accounts require special verification. You will be notified once approved.'
                        : 'Your account will be reviewed by the administrator. You will be notified once approved.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApprovalModalClose}
                className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-xl hover:bg-blue-800 transition-all duration-200 text-sm lg:text-base min-h-[44px]"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}