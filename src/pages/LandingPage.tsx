import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, Home, GraduationCap, Users, Calendar, Award, Shield, Heart } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const handleManagementClick = () => {
    navigate('/login');
  };

  const handleParentClick = () => {
    navigate('/parent-attendance');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 sm:top-40 right-16 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-white/5 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-16 sm:bottom-32 left-1/4 sm:left-1/3 w-20 h-20 sm:w-40 sm:h-40 bg-white/5 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-14 h-14 sm:w-28 sm:h-28 bg-white/10 rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Header Section */}
        <div className="mb-12 sm:mb-16">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-white/20 p-4 sm:p-6 lg:p-8 rounded-full animate-pulse">
              <img 
                src="/trinity-logo.png" 
                alt="Trinity Track Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain filter brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">Trinity</div>';
                }}
              />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
            Welcome to Trinity Track
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8">
            Complete Student & Faculty Management System
          </p>
          <p className="text-sm sm:text-base lg:text-lg text-blue-200 max-w-2xl mx-auto">
            Choose your portal to access the features designed for you
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-4xl mx-auto">
          {/* Management Portal */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 sm:p-6 lg:p-8 rounded-full group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300 shadow-lg">
                  <UserCog className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                Management Portal
              </h2>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                For administrators, faculty, and committee members to manage students, attendance, timetables, and achievements.
              </p>
              
              <button
                onClick={handleManagementClick}
                className="w-full bg-white text-[#002e5d] py-3 sm:py-4 lg:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg lg:text-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Access Management Portal
              </button>
            </div>
          </div>

          {/* Parent Portal */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 sm:p-6 lg:p-8 rounded-full group-hover:from-green-300 group-hover:to-green-500 transition-all duration-300 shadow-lg">
                  <Heart className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                Parent Portal
              </h2>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                For parents to check their child's daily attendance records and stay connected with their academic progress.
              </p>
              
              <button
                onClick={handleParentClick}
                className="w-full bg-white text-green-600 py-3 sm:py-4 lg:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg lg:text-xl hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Check Child's Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              Trinity Track Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-blue-200 text-xs sm:text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Attendance Management</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Achievement Tracking</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Leave Management</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 text-blue-200 text-xs sm:text-sm">
            <p>© 2025 Trinity Track - Student & Faculty Management System</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <span>Powered by</span>
              <a 
                href="https://doutly.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors duration-200"
              >
                Doutly
              </a>
              <span>&</span>
              <a 
                href="https://sugarsaltmedia.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors duration-200"
              >
                Sugarsaltmedia
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 opacity-5 animate-spin-slow" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" fill="none" strokeDasharray="10,5" />
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1" fill="none" strokeDasharray="5,3" />
          <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="1" fill="none" strokeDasharray="3,2" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}