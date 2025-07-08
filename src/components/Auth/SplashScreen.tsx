import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-white/5 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/10 rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="text-center z-10">
        {/* Logo Animation */}
        <div className="mb-8 relative">
          <div className="bg-white/20 backdrop-blur-sm p-8 rounded-full inline-block animate-pulse">
            <GraduationCap className="h-24 w-24 text-white animate-bounce" />
          </div>
          <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
        </div>

        {/* Title with Typewriter Effect */}
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Trinity College
        </h1>
        <p className="text-xl text-blue-100 mb-8 animate-fade-in-delay">
          Student & Faculty Management System
        </p>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-blue-100 text-sm">Loading... {progress}%</p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-96 h-96 opacity-10 animate-spin-slow" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" fill="none" strokeDasharray="10,5" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 0.5s both;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}