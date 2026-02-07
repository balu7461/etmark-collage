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
      <div className="min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex items-center justify-center px-4 py-8 overflow-y-auto relative">
        {/* Subtle animated mesh gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 animate-gradient"></div>
        </div>

        {/* Minimal geometric shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-3 h-3 bg-white/10 transform rotate-45 animate-float"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-white/15 transform rotate-45 animate-float-delayed"></div>
          <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-white/10 transform rotate-45 animate-float-slow"></div>
        </div>

        <div className="max-w-md w-full my-8 relative z-10">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-3xl"></div>

            {/* Main card with glassmorphism */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 lg:p-10 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <img
                      src="/trinity-logo.png"
                      alt="Trinity Track Logo"
                      className="h-12 w-12 object-contain filter brightness-0 invert"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-white text-2xl font-light">TRINITY</div>';
                        }
                      }}
                    />
                  </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-light text-white mb-2 tracking-wide">Create Account</h1>
                <p className="text-sm lg:text-base text-blue-100/70 font-light">Join the management team</p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white placeholder-blue-200/50 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white placeholder-blue-200/50 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="Enter your phone"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white placeholder-blue-200/50 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={handleChange('role')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white backdrop-blur-sm"
                  required
                >
                  <option value="faculty" className="bg-[#002e5d]">Faculty</option>
                  <option value="timetable_committee" className="bg-[#002e5d]">Timetable Committee</option>
                  <option value="examination_committee" className="bg-[#002e5d]">Examination Committee</option>
                  <option value="achievements_committee" className="bg-[#002e5d]">Achievements Committee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white placeholder-blue-200/50 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white placeholder-blue-200/50 backdrop-blur-sm"
                  required
                />
              </div>

              {(formData.role === 'timetable_committee' || formData.role === 'examination_committee' || formData.role === 'achievements_committee') && (
                <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <Crown className="h-5 w-5 text-cyan-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white mb-1 text-sm">
                        {getRoleDisplayName(formData.role)} Account
                      </h4>
                      <p className="text-xs text-blue-100/70">
                        {formData.role === 'timetable_committee'
                          ? 'Committee members can review leave applications and manage timetables.'
                          : formData.role === 'examination_committee'
                          ? 'Committee members can review leave applications and manage schedules.'
                          : 'Committee members can manage student achievements and recognition.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/90 backdrop-blur-sm text-[#002e5d] py-4 px-4 rounded-2xl hover:bg-white focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium text-base shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#002e5d]"></div>
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
                className="flex items-center justify-center space-x-2 text-blue-100/80 hover:text-white transition-colors text-sm px-4 py-2 font-light"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(45deg);
            }
            50% {
              transform: translateY(-20px) rotate(45deg);
            }
          }

          @keyframes gradient {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.5;
            }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float 6s ease-in-out 2s infinite;
          }

          .animate-float-slow {
            animation: float 8s ease-in-out 1s infinite;
          }

          .animate-gradient {
            animation: gradient 4s ease-in-out infinite;
          }
        `}</style>
      </div>

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-cyan-400/20 p-4 rounded-2xl border border-white/20">
                  <CheckCircle className="h-10 w-10 text-cyan-300" />
                </div>
              </div>
              <h3 className="text-2xl font-light text-white mb-3 tracking-wide">Account Created</h3>
              <p className="text-sm text-blue-100/70 mb-6 font-light">
                Your {getRoleDisplayName(formData.role).toLowerCase()} account has been created and is pending approval.
              </p>

              <div className="bg-white/5 border border-white/20 rounded-2xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-cyan-300 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-medium text-white mb-1 text-sm">Approval Required</h4>
                    <p className="text-xs text-blue-100/70">
                      {formData.role === 'timetable_committee' || formData.role === 'examination_committee' || formData.role === 'achievements_committee'
                        ? 'Committee accounts require special verification. You will be notified once approved.'
                        : 'Your account will be reviewed by the administrator. You will be notified once approved.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApprovalModalClose}
                className="w-full bg-white/90 backdrop-blur-sm text-[#002e5d] py-4 px-4 rounded-2xl hover:bg-white transition-all font-medium shadow-lg hover:shadow-xl hover:scale-105 transform"
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