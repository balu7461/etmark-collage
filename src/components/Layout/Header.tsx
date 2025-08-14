import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { currentUser } = useAuth();

  const getRoleDisplay = () => {
    switch (currentUser?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'timetable_committee':
        return 'Timetable Committee';
      case 'examination_committee':
        return 'Examination Committee';
      case 'achievements_committee':
        return 'Achievements Committee';
      case 'faculty':
        return 'Faculty Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h2 className="text-lg lg:text-2xl font-semibold text-gray-900 truncate">
            {getRoleDisplay()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search - hidden on mobile, shown on larger screens */}
          <div className="relative hidden md:block">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
            />
          </div>
          
          {/* Mobile search button */}
          <button className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="p-2 bg-[#002e5d] rounded-full">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="text-sm hidden sm:block">
              <p className="font-medium text-gray-900 truncate max-w-32 lg:max-w-none">{currentUser?.name}</p>
              <p className="text-gray-500 capitalize text-xs lg:text-sm">{currentUser?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}