import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onShowSignup: () => void;
}

export function LoginForm({ onShowSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[#002e5d] p-3 rounded-full animate-pulse">
                <img 
                  src="/src/assets/New_Triity_Logo.pdf-removebg-preview.png" 
                  alt="Trinity Track Logo" 
                  className="h-8 w-8"
                />
              </div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Trinity Track</h1>
            <p className="text-sm lg:text-base text-gray-600 mb-2">Student & Faculty Management System</p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs lg:text-sm text-gray-500 font-medium">
              <span>Powered by</span>
              <div className="flex items-center space-x-2">
                <a 
                  href="https://doutly.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#002e5d] hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  Doutly
                </a>
                <span className="text-gray-400">&</span>
                <a 
                  href="https://sugarsaltmedia.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#002e5d] hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  <img 
                    src="/src/assets/New Triity Logo.pdf.png" 
                    alt="Sugarsaltmedia" 
                    className="h-3 w-3 sm:h-4 sm:w-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span>Sugarsaltmedia</span>
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105 text-sm lg:text-base min-h-[44px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onShowSignup}
              className="text-[#002e5d] hover:text-blue-800 font-medium flex items-center justify-center space-x-2 mx-auto transition-colors text-sm lg:text-base min-h-[44px] px-4"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Faculty Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}