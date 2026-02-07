import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const handleParentClick = () => {
    navigate('/parent-attendance');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
      {/* Subtle animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 animate-gradient"></div>
      </div>

      {/* Minimal geometric shapes - triangles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-3 h-3 bg-white/10 transform rotate-45 animate-float"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-white/15 transform rotate-45 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-white/10 transform rotate-45 animate-float-slow"></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-white/20 transform rotate-45 animate-float"></div>
      </div>

      <div className="max-w-2xl mx-auto px-6 text-center z-10">
        {/* Logo Section */}
        <div className="mb-12 animate-fade-in">
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-3xl rounded-full scale-150"></div>

            {/* Logo */}
            <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl inline-block">
              <img
                src="/trinity-logo.png"
                alt="Trinity Track Logo"
                className="h-20 w-20 object-contain filter brightness-0 invert animate-subtle-pulse"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-white text-4xl font-light tracking-wider">TRINITY</div>';
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-16 animate-fade-in-delayed">
          <h1 className="text-5xl font-light text-white mb-4 tracking-wide">
            Trinity Track
          </h1>
          <p className="text-lg text-blue-100/80 font-light">
            Student Progress Tracking
          </p>
        </div>

        {/* Single Parent Portal Card */}
        <div className="group animate-scale-in-delayed">
          <div className="relative">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-400/10 blur-2xl transition-all duration-500 rounded-3xl"></div>

            {/* Main card */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all duration-500 shadow-2xl group-hover:shadow-cyan-500/10 group-hover:transform group-hover:scale-105">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-cyan-400/20 to-blue-500/20 p-6 rounded-2xl border border-white/20 group-hover:scale-110 transition-transform duration-500">
                  <Heart className="h-16 w-16 text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Content */}
              <h2 className="text-3xl font-light text-white mb-4 tracking-wide">
                Parent Portal
              </h2>
              <p className="text-blue-100/70 text-base leading-relaxed mb-8 font-light">
                Check your child's attendance and academic progress
              </p>

              {/* Button */}
              <button
                onClick={handleParentClick}
                className="w-full bg-white/90 backdrop-blur-sm text-[#002e5d] py-4 px-8 rounded-2xl font-medium text-lg hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
              >
                View Attendance
              </button>
            </div>
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}