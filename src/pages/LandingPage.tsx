import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, GraduationCap, Building2 } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [isScaling, setIsScaling] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    setIsScaling(true);
    setTimeout(() => setIsScaling(false), 150);

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (newCount === 3) {
      navigate('/login');
      setClickCount(0);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleParentClick = () => {
    navigate('/parent-attendance');
  };

  const handleStudentClick = () => {
    navigate('/login');
  };

  const handleFacultyClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex flex-col relative overflow-hidden">
      {/* Dynamic gradient mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 animate-gradient"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-blue-400/10 via-transparent to-cyan-400/10 animate-gradient-reverse"></div>
      </div>

      {/* Animated grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-3 h-3 bg-white/10 transform rotate-45 animate-float"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-cyan-400/20 transform rotate-45 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-blue-300/15 transform rotate-45 animate-float-slow"></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-white/20 transform rotate-45 animate-float"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-cyan-300/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-blue-400/20 rounded-full animate-float-slow"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl w-full z-10">
          {/* Logo Section with triple-click */}
          <div className="mb-12 animate-fade-in text-center">
            <div className="relative inline-block">
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 blur-3xl rounded-full scale-150"></div>

              {/* Logo container with click handler */}
              <div
                className={`relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl inline-block cursor-pointer transition-transform duration-150 ${isScaling ? 'scale-95' : 'hover:scale-105'}`}
                onClick={handleLogoClick}
              >
                <img
                  src="/trinity-logo.png"
                  alt="Trinity Track Logo"
                  className="h-20 w-20 object-contain filter brightness-0 invert animate-subtle-pulse"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-white text-4xl font-semibold tracking-wider">TRINITY</div>';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hero Header */}
          <div className="mb-16 text-center animate-fade-in-delayed">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-100 mb-6 tracking-tight leading-tight">
              Trinity Track
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/90 font-normal max-w-3xl mx-auto leading-relaxed">
              Comprehensive Student & Faculty Management System
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-cyan-400/10 backdrop-blur-sm text-cyan-200 rounded-full text-sm font-medium border border-cyan-400/20">
                Real-time Tracking
              </span>
              <span className="px-4 py-2 bg-blue-400/10 backdrop-blur-sm text-blue-200 rounded-full text-sm font-medium border border-blue-400/20">
                24/7 Access
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium border border-white/20">
                Secure & Reliable
              </span>
            </div>
          </div>

          {/* Three Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 animate-scale-in-delayed">
            {/* Parents Portal */}
            <div className="group">
              <div className="relative h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/0 to-rose-400/0 group-hover:from-pink-400/20 group-hover:to-rose-400/20 blur-2xl transition-all duration-500 rounded-3xl"></div>

                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-pink-300/40 transition-all duration-500 shadow-2xl group-hover:shadow-pink-500/20 group-hover:transform group-hover:scale-105 h-full flex flex-col">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-pink-400/20 to-rose-500/20 p-5 rounded-2xl border border-pink-300/30 group-hover:scale-110 transition-transform duration-500">
                      <Heart className="h-12 w-12 text-pink-200" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-semibold text-white mb-3 tracking-wide text-center">
                    Parents Portal
                  </h2>
                  <p className="text-blue-100/70 text-base leading-relaxed mb-6 text-center flex-grow">
                    Monitor your child's attendance, academic progress, and achievements in real-time
                  </p>

                  {/* Button */}
                  <button
                    onClick={handleParentClick}
                    className="w-full bg-gradient-to-r from-pink-400/90 to-rose-400/90 backdrop-blur-sm text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:from-pink-400 hover:to-rose-400 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 group-hover:scale-105"
                  >
                    Access Portal
                  </button>
                </div>
              </div>
            </div>

            {/* Students Portal */}
            <div className="group">
              <div className="relative h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/20 group-hover:to-blue-400/20 blur-2xl transition-all duration-500 rounded-3xl"></div>

                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-cyan-300/40 transition-all duration-500 shadow-2xl group-hover:shadow-cyan-500/20 group-hover:transform group-hover:scale-105 h-full flex flex-col">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-cyan-400/20 to-blue-500/20 p-5 rounded-2xl border border-cyan-300/30 group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap className="h-12 w-12 text-cyan-200" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-semibold text-white mb-3 tracking-wide text-center">
                    Students Portal
                  </h2>
                  <p className="text-blue-100/70 text-base leading-relaxed mb-6 text-center flex-grow">
                    View your timetable, track attendance, manage leaves, and showcase your achievements
                  </p>

                  {/* Button */}
                  <button
                    onClick={handleStudentClick}
                    className="w-full bg-gradient-to-r from-cyan-400/90 to-blue-400/90 backdrop-blur-sm text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 group-hover:scale-105"
                  >
                    Access Portal
                  </button>
                </div>
              </div>
            </div>

            {/* Faculty/Management Portal */}
            <div className="group">
              <div className="relative h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-emerald-400/0 group-hover:from-teal-400/20 group-hover:to-emerald-400/20 blur-2xl transition-all duration-500 rounded-3xl"></div>

                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-teal-300/40 transition-all duration-500 shadow-2xl group-hover:shadow-teal-500/20 group-hover:transform group-hover:scale-105 h-full flex flex-col">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-teal-400/20 to-emerald-500/20 p-5 rounded-2xl border border-teal-300/30 group-hover:scale-110 transition-transform duration-500">
                      <Building2 className="h-12 w-12 text-teal-200" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-semibold text-white mb-3 tracking-wide text-center">
                    Faculty Portal
                  </h2>
                  <p className="text-blue-100/70 text-base leading-relaxed mb-6 text-center flex-grow">
                    Manage attendance, approve leaves, create timetables, and oversee student achievements
                  </p>

                  {/* Button */}
                  <button
                    onClick={handleFacultyClick}
                    className="w-full bg-gradient-to-r from-teal-400/90 to-emerald-400/90 backdrop-blur-sm text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:from-teal-400 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-teal-500/50 group-hover:scale-105"
                  >
                    Access Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-white/60 leading-relaxed">
            © 2025 Trinity Track - Student & Faculty Management System
          </p>
          <p className="text-xs text-white/40 mt-1">
            Powered by Doutly & Sugarsaltmedia
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes subtle-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.02);
          }
        }

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

        @keyframes gradient-reverse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.5s both;
        }

        .animate-scale-in-delayed {
          animation: scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
        }

        .animate-subtle-pulse {
          animation: subtle-pulse 3s ease-in-out infinite;
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

        .animate-gradient-reverse {
          animation: gradient-reverse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
