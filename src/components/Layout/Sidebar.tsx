import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Award, 
  Settings, 
  LogOut,
  GraduationCap,
  Clock,
  BarChart3,
  UserCog,
  CalendarDays,
  UserCheck,
  Users,
  GraduationCapIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const adminLinks = [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/user-management', icon: UserCog, label: 'User Management' },
    { to: '/faculty-approval', icon: UserCheck, label: 'Faculty Approval' },
    { to: '/student-approval', icon: GraduationCapIcon, label: 'Student Approval' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/timetable', icon: CalendarDays, label: 'Timetable' },
    { to: '/achievements', icon: Award, label: 'Achievements' },
    { to: '/leave-management', icon: FileText, label: 'Leave Management' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const committeeMemberLinks = [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/my-timetable', icon: CalendarDays, label: 'My Timetable' },
    { to: '/leave-management', icon: FileText, label: 'Leave Management' },
    { to: '/my-leaves', icon: FileText, label: 'My Leaves' },
    { to: '/my-achievements', icon: Award, label: 'My Achievements' },
  ];

  const facultyLinks = [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/mark-attendance', icon: Clock, label: 'Mark Attendance' },
    { to: '/my-timetable', icon: CalendarDays, label: 'My Timetable' },
    { to: '/my-leaves', icon: FileText, label: 'My Leaves' },
    { to: '/my-achievements', icon: Award, label: 'My Achievements' },
  ];

  const getLinks = () => {
    switch (currentUser?.role) {
      case 'admin':
        return adminLinks;
      case 'committee_member':
        return committeeMemberLinks;
      case 'faculty':
        return facultyLinks;
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    switch (currentUser?.role) {
      case 'admin':
        return 'Admin Panel';
      case 'committee_member':
        return 'Committee Panel';
      case 'faculty':
        return 'Faculty Panel';
      default:
        return 'Panel';
    }
  };

  const links = getLinks();

  return (
    <div className="bg-[#002e5d] text-white w-64 min-h-screen flex flex-col shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-blue-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <GraduationCap className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Trinity College</h1>
            <p className="text-blue-300 text-sm">{getRoleLabel()}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto sidebar-content">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`
                }
              >
                <link.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-800 flex-shrink-0">
        <div className="mb-4 p-3 bg-blue-800/50 rounded-lg">
          <p className="text-sm text-blue-300">Logged in as</p>
          <p className="font-medium truncate">{currentUser?.name}</p>
          <p className="text-xs text-blue-400 truncate">{currentUser?.email}</p>
          <p className="text-xs text-blue-400 capitalize">{currentUser?.role}</p>
          {currentUser?.department && (
            <p className="text-xs text-blue-400">{currentUser.department}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-blue-100 hover:bg-blue-800 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}