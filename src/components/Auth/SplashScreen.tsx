import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex items-center justify-center relative overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Subtle animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 animate-gradient"></div>
      </div>

      {/* Minimal geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 transform rotate-45 animate-float"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-white/10 transform rotate-45 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-white/15 transform rotate-45 animate-float-slow"></div>
      </div>

      <div className="text-center z-10 px-4">
        {/* Premium glassmorphic card with logo */}
        <div className="inline-block animate-scale-in">
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-3xl rounded-full scale-150"></div>

            {/* Glass card */}
            <div className="relative bg-white/10 backdrop-blur-md p-12 rounded-3xl border border-white/20 shadow-2xl">
              <div className="relative">
                {/* Logo */}
                <div className="h-32 w-32 mx-auto flex items-center justify-center mb-6">
                  <img
                    src="/trinity-logo.png"
                    alt="Trinity Track"
                    className="h-24 w-24 object-contain filter brightness-0 invert animate-subtle-pulse"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="text-white text-4xl font-light tracking-wider">TRINITY</div>';
                      }
                    }}
                  />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-light text-white mb-2 tracking-wide animate-fade-in">
                  Trinity Track
                </h1>
                <p className="text-sm text-blue-100/80 font-light tracking-widest uppercase animate-fade-in-delayed">
                  Student Progress Tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal loading indicator */}
        <div className="flex justify-center space-x-2 mt-12 animate-fade-in-late">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-dot"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-dot-delayed"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-dot-more-delayed"></div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out 0.3s both;
        }

        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.5s both;
        }

        .animate-fade-in-late {
          animation: fade-in 0.8s ease-out 0.8s both;
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

        .animate-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        .animate-pulse-dot-delayed {
          animation: pulse-dot 1.5s ease-in-out 0.2s infinite;
        }

        .animate-pulse-dot-more-delayed {
          animation: pulse-dot 1.5s ease-in-out 0.4s infinite;
        }
      `}</style>
    </div>
  );
}