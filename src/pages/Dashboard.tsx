import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { Header } from '../components/Layout/Header';
import { 
  Users, 
  Calendar, 
  FileText, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  UserCog,
  Building,
  CalendarDays,
  BookOpen,
  UserCheck,
  GraduationCap
} from 'lucide-react';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalUsers: 0,
    pendingFacultyApprovals: 0,
    pendingStudentApprovals: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalAchievements: 0,
    totalTimeSlots: 0,
    attendanceRate: 0,
    departmentStats: {} as Record<string, { faculty: number; students: number }>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [currentUser]);

  const fetchDashboardStats = async () => {
    try {
      if (currentUser?.role === 'admin') {
        // Fetch admin stats
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const totalStudents = studentsSnapshot.size;

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Fetch pending faculty approvals
        const pendingFacultyQuery = query(
          collection(db, 'users'),
          where('isApproved', '==', false)
        );
        const pendingFacultySnapshot = await getDocs(pendingFacultyQuery);
        const pendingFacultyApprovals = pendingFacultySnapshot.size;

        // Fetch pending student approvals
        const pendingStudentQuery = query(
          collection(db, 'students'),
          where('isApproved', '==', false)
        );
        const pendingStudentSnapshot = await getDocs(pendingStudentQuery);
        const pendingStudentApprovals = pendingStudentSnapshot.size;

        const today = new Date().toISOString().split('T')[0];
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '==', today)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const presentToday = attendanceSnapshot.docs.filter(
          doc => doc.data().status === 'present'
        ).length;

        const pendingLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_principal_approval')
        );
        const pendingLeavesSnapshot = await getDocs(pendingLeavesQuery);
        const pendingLeaves = pendingLeavesSnapshot.size;

        const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
        const totalAchievements = achievementsSnapshot.size;

        const timeSlotsSnapshot = await getDocs(collection(db, 'timeSlots'));
        const totalTimeSlots = timeSlotsSnapshot.size;

        const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

        // Calculate department stats
        const departments = ['BBA', 'BCA', 'BCOM', 'MCOM'];
        const departmentStats: Record<string, { faculty: number; students: number }> = {};
        
        for (const dept of departments) {
          const facultyCount = usersSnapshot.docs.filter(
            doc => doc.data().department === dept && (doc.data().role === 'faculty' || doc.data().role === 'committee_member')
          ).length;
          
          const studentCount = studentsSnapshot.docs.filter(
            doc => doc.data().department === dept
          ).length;
          
          departmentStats[dept] = { faculty: facultyCount, students: studentCount };
        }

        setStats({
          totalStudents,
          totalUsers,
          pendingFacultyApprovals,
          pendingStudentApprovals,
          presentToday,
          pendingLeaves,
          totalAchievements,
          totalTimeSlots,
          attendanceRate,
          departmentStats
        });
      } else {
        // Fetch faculty stats
        const myLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('facultyId', '==', currentUser?.id),
          where('status', 'in', ['pending_committee_approval', 'pending_principal_approval'])
        );
        const myLeavesSnapshot = await getDocs(myLeavesQuery);
        const pendingLeaves = myLeavesSnapshot.size;

        const myAchievementsQuery = query(
          collection(db, 'achievements'),
          where('facultyId', '==', currentUser?.id)
        );
        const myAchievementsSnapshot = await getDocs(myAchievementsQuery);
        const totalAchievements = myAchievementsSnapshot.size;

        const myTimeSlotsQuery = query(
          collection(db, 'timeSlots'),
          where('facultyId', '==', currentUser?.id)
        );
        const myTimeSlotsSnapshot = await getDocs(myTimeSlotsQuery);
        const totalTimeSlots = myTimeSlotsSnapshot.size;

        setStats({
          totalStudents: 0,
          totalUsers: 0,
          pendingFacultyApprovals: 0,
          pendingStudentApprovals: 0,
          presentToday: 0,
          pendingLeaves,
          totalAchievements,
          totalTimeSlots,
          attendanceRate: 0,
          departmentStats: {}
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening in your {currentUser?.role === 'admin' ? 'institution' : 'dashboard'} today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {currentUser?.role === 'admin' ? (
              <>
                <StatsCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon={UserCog}
                  color="purple"
                  trend={{ value: 5.2, isPositive: true }}
                />
                <StatsCard
                  title="Faculty Approvals"
                  value={stats.pendingFacultyApprovals}
                  icon={UserCheck}
                  color="yellow"
                />
                <StatsCard
                  title="Student Approvals"
                  value={stats.pendingStudentApprovals}
                  icon={GraduationCap}
                  color="red"
                />
                <StatsCard
                  title="Total Students"
                  value={stats.totalStudents.toLocaleString()}
                  icon={Users}
                  color="blue"
                  trend={{ value: 3.1, isPositive: true }}
                />
              </>
            ) : (
              <>
                <StatsCard
                  title="My Pending Leaves"
                  value={stats.pendingLeaves}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="My Achievements"
                  value={stats.totalAchievements}
                  icon={Award}
                  color="purple"
                />
                <StatsCard
                  title="My Classes"
                  value={stats.totalTimeSlots}
                  icon={CalendarDays}
                  color="blue"
                />
                <StatsCard
                  title="Performance"
                  value="Excellent"
                  icon={TrendingUp}
                  color="green"
                />
              </>
            )}
          </div>

          {currentUser?.role === 'admin' && (
            <>
              {/* Additional Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatsCard
                  title="Present Today"
                  value={stats.presentToday.toLocaleString()}
                  icon={CheckCircle}
                  color="green"
                />
                <StatsCard
                  title="Pending Leaves"
                  value={stats.pendingLeaves}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="Total Achievements"
                  value={stats.totalAchievements}
                  icon={Award}
                  color="yellow"
                />
                <StatsCard
                  title="Time Slots"
                  value={stats.totalTimeSlots}
                  icon={CalendarDays}
                  color="blue"
                />
              </div>

              {/* Approval Alerts */}
              {(stats.pendingFacultyApprovals > 0 || stats.pendingStudentApprovals > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-red-900 mb-2">Pending Approvals Require Attention</h3>
                      <div className="space-y-1 text-sm text-red-800">
                        {stats.pendingFacultyApprovals > 0 && (
                          <p>• {stats.pendingFacultyApprovals} faculty/HOD registration{stats.pendingFacultyApprovals > 1 ? 's' : ''} pending approval</p>
                        )}
                        {stats.pendingStudentApprovals > 0 && (
                          <p>• {stats.pendingStudentApprovals} student registration{stats.pendingStudentApprovals > 1 ? 's' : ''} pending approval</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Department Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Building className="h-6 w-6 text-[#002e5d]" />
                    <h3 className="text-lg font-medium text-gray-900">Department Overview</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(stats.departmentStats).map(([dept, data]) => (
                      <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{dept}</h4>
                          <p className="text-sm text-gray-600">
                            {data.faculty} Faculty • {data.students} Students
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {data.faculty + data.students} Total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    {stats.pendingFacultyApprovals > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <UserCheck className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {stats.pendingFacultyApprovals} faculty approval{stats.pendingFacultyApprovals > 1 ? 's' : ''} pending
                          </p>
                          <p className="text-xs text-gray-500">Requires your attention</p>
                        </div>
                      </div>
                    )}
                    {stats.pendingStudentApprovals > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <GraduationCap className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {stats.pendingStudentApprovals} student approval{stats.pendingStudentApprovals > 1 ? 's' : ''} pending
                          </p>
                          <p className="text-xs text-gray-500">Requires your attention</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Attendance marked for BCA-A</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New leave application received</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Award className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New achievement submitted</p>
                        <p className="text-xs text-gray-500">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {Math.round(stats.attendanceRate)}%
                    </div>
                    <p className="text-sm text-gray-600">Today's Attendance Rate</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {stats.totalAchievements}
                    </div>
                    <p className="text-sm text-gray-600">Total Achievements</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {stats.pendingLeaves}
                    </div>
                    <p className="text-sm text-gray-600">Pending Reviews</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {stats.totalTimeSlots}
                    </div>
                    <p className="text-sm text-gray-600">Scheduled Classes</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-orange-600 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}