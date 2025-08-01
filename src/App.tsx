import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SplashScreen } from './components/Auth/SplashScreen';
import { AuthContainer } from './components/Auth/AuthContainer';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { FacultyApproval } from './pages/FacultyApproval';
import { StudentApproval } from './pages/StudentApproval';
import { Students } from './pages/Students';
import { Attendance } from './pages/Attendance';
import { StudentOverallAttendance } from './pages/StudentOverallAttendance';
import { MarkAttendance } from './pages/MarkAttendance';
import { Timetable } from './pages/Timetable';
import { MyTimetable } from './pages/MyTimetable';
import { LeaveManagement } from './pages/LeaveManagement';
import { MyLeaves } from './pages/MyLeaves';
import { Achievements } from './pages/Achievements';
import { MyAchievements } from './pages/MyAchievements';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    // Show splash screen for 5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002e5d] to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthContainer />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Admin-only routes */}
            {currentUser.role === 'admin' && (
              <>
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/faculty-approval" element={<FacultyApproval />} />
                <Route path="/student-approval" element={<StudentApproval />} />
                <Route path="/students" element={<Students />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/student-attendance" element={<StudentOverallAttendance />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/leave-management" element={<LeaveManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </>
            )}
            
            {/* Timetable Committee routes */}
            {currentUser.role === 'timetable_committee' && (
              <>
                <Route path="/my-timetable" element={<MyTimetable />} />
                <Route path="/leave-management" element={<LeaveManagement />} />
                <Route path="/my-leaves" element={<MyLeaves />} />
                <Route path="/my-achievements" element={<MyAchievements />} />
              </>
            )}
            
            {/* Examination Committee routes */}
            {currentUser.role === 'examination_committee' && (
              <>
                <Route path="/my-timetable" element={<MyTimetable />} />
                <Route path="/leave-management" element={<LeaveManagement />} />
                <Route path="/my-leaves" element={<MyLeaves />} />
                <Route path="/my-achievements" element={<MyAchievements />} />
              </>
            )}
            
            {/* Committee Member routes */}
            {currentUser.role === 'committee_member' && (
              <>
                <Route path="/my-timetable" element={<MyTimetable />} />
                <Route path="/leave-management" element={<LeaveManagement />} />
                <Route path="/my-leaves" element={<MyLeaves />} />
                <Route path="/my-achievements" element={<MyAchievements />} />
              </>
            )}
            
            {/* Faculty-only routes */}
            {currentUser.role === 'faculty' && (
              <>
                <Route path="/mark-attendance" element={<MarkAttendance />} />
                <Route path="/my-timetable" element={<MyTimetable />} />
                <Route path="/my-leaves" element={<MyLeaves />} />
                <Route path="/my-achievements" element={<MyAchievements />} />
              </>
            )}
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;