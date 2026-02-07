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
    <div className="min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
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

      <div className="max-w-md w-full relative z-10">
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
              <h1 className="text-3xl lg:text-4xl font-light text-white mb-2 tracking-wide">Management Portal</h1>
              <p className="text-sm lg:text-base text-blue-100/70 font-light">Sign in to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200/60 group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white placeholder-blue-200/50 backdrop-blur-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100/90 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200/60 group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 focus:border-white/40 transition-all text-white placeholder-blue-200/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/90 backdrop-blur-sm text-[#002e5d] py-4 px-4 rounded-2xl hover:bg-white focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium text-base lg:text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#002e5d]"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={onShowSignup}
                className="text-blue-100/80 hover:text-white font-light flex items-center justify-center space-x-2 mx-auto transition-colors text-sm lg:text-base px-4 py-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Faculty Account</span>
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
  );
}