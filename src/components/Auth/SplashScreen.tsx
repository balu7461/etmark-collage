import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Show logo first
    setTimeout(() => setShowLogo(true), 500);
    // Show text after logo
    setTimeout(() => setShowText(true), 1500);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1.5;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002e5d] via-blue-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 sm:top-40 right-16 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-white/5 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-16 sm:bottom-32 left-1/4 sm:left-1/3 w-20 h-20 sm:w-40 sm:h-40 bg-white/5 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-14 h-14 sm:w-28 sm:h-28 bg-white/10 rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="text-center z-10 px-4 sm:px-6 lg:px-8">
        {/* Logo Animation with Trinity Logo */}
        <div className="mb-6 sm:mb-8 relative">
          <div className={`transition-all duration-1000 ${showLogo ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="bg-white/20 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-full inline-block animate-pulse">
              <div className="relative">
                {/* Trinity College Logo */}
                <img 
                  src="/src/assets/New_Triity_Logo.pdf-removebg-preview.png" 
                  alt="Trinity Track Logo" 
                  className="h-16 w-16 sm:h-20 sm:w-20 lg:h-28 lg:w-28 animate-bounce mx-auto"
                  onError={(e) => {
                    // Fallback to graduation cap icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }}
                />
                <GraduationCap className="h-16 w-16 sm:h-20 sm:w-20 lg:h-28 lg:w-28 text-white animate-bounce hidden" />
                {/* Pulsing rings around logo */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
          {/* Floating particles around logo */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping delay-200"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-ping delay-300"></div>
          </div>
        </div>

        {/* Title with Enhanced Animation */}
        <div className={`transition-all duration-1000 delay-500 ${showText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-4 animate-fade-in">
            <span className="inline-block animate-bounce delay-100">T</span>
            <span className="inline-block animate-bounce delay-200">r</span>
            <span className="inline-block animate-bounce delay-300">i</span>
            <span className="inline-block animate-bounce delay-400">n</span>
            <span className="inline-block animate-bounce delay-500">i</span>
            <span className="inline-block animate-bounce delay-600">t</span>
            <span className="inline-block animate-bounce delay-700">y</span>
            <span className="inline-block mx-2 sm:mx-3"></span>
            <span className="inline-block animate-bounce delay-800 text-yellow-300">T</span>
            <span className="inline-block animate-bounce delay-900 text-yellow-300">r</span>
            <span className="inline-block animate-bounce delay-1000 text-yellow-300">a</span>
            <span className="inline-block animate-bounce delay-1100 text-yellow-300">c</span>
            <span className="inline-block animate-bounce delay-1200 text-yellow-300">k</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 animate-fade-in-delay">
            Student & Faculty Management System
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-blue-200 mb-6 sm:mb-8 animate-fade-in-delay-2">
            <span>Powered by</span>
            <div className="flex items-center space-x-4">
              <a 
                href="https://doutly.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors duration-200 hover:scale-105 transform"
              >
                Doutly
              </a>
              <span className="text-blue-300">&</span>
              <a 
                href="https://sugarsaltmedia.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-yellow-300 hover:text-yellow-200 font-semibold transition-colors duration-200 hover:scale-105 transform"
              >
                <img 
                  src="/src/assets/New Triity Logo.pdf.png" 
                  alt="Sugarsaltmedia" 
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>Sugarsaltmedia</span>
              </a>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-64 sm:w-80 lg:w-96 mx-auto">
          <div className="bg-white/20 rounded-full h-2 sm:h-3 mb-3 sm:mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-white via-yellow-300 to-white rounded-full h-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-blue-100 text-xs sm:text-sm">Loading Trinity Track...</p>
            <p className="text-blue-100 text-xs sm:text-sm font-bold">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1 sm:space-x-2 mt-4 sm:mt-6">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/60 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/60 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>

      {/* Floating Elements with improved responsiveness */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 opacity-10 animate-spin-slow" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" fill="none" strokeDasharray="10,5" />
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1" fill="none" strokeDasharray="5,3" />
          <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="1" fill="none" strokeDasharray="3,2" />
        </svg>
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
        @keyframes fade-in-delay-2 {
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
        .animate-fade-in-delay-2 {
          animation: fade-in-delay-2 1s ease-out 1s both;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}