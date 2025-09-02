import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthContainer } from './components/Auth/AuthContainer';
import { SplashScreen } from './components/Auth/SplashScreen';
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
import { StudentAchievements } from './pages/StudentAchievements';
import { AchievementsCommitteeDashboard } from './pages/AchievementsCommitteeDashboard';
import { ParentAttendanceCheck } from './pages/ParentAttendanceCheck';
import { LandingPage } from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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

  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/parent-attendance" element={<ParentAttendanceCheck />} />
      
      {/* Authentication Routes */}
      <Route path="/login" element={!currentUser ? <AuthContainer /> : <Navigate to="/dashboard" replace />} />
      
      {/* Root redirect to welcome page */}
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      
      {/* Protected Routes - Authentication required */}
      <Route path="/*" element={
        !currentUser ? (
          <Navigate to="/login" replace />
        ) : (
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
                  {currentUser.role === 'achievements_committee' ? (
                    <Route path="/dashboard" element={<Navigate to="/achievements-dashboard" replace />} />
                  ) : (
                    <Route path="/dashboard" element={<Dashboard />} />
                  )}
                  
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
                  
                  {/* Achievements Committee routes */}
                  {currentUser.role === 'achievements_committee' && (
                    <>
                      <Route path="/achievements-dashboard" element={<AchievementsCommitteeDashboard />} />
                      <Route path="/student-achievements" element={<StudentAchievements />} />
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
        )
      } />
    </Routes>
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