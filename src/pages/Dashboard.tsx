import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { Header } from '../components/Layout/Header';
import { StudentAchievement } from '../types';
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
  GraduationCap,
  Clock3,
  FileCheck,
  Trophy,
  Star
} from 'lucide-react';

const ALL_CLASSES = [
  'B.com 1st Year', 'B.com 2nd Year', 'B.com 3rd Year',
  'BBA 1st Year', 'BBA 2nd Year', 'BBA 3rd Year',
  'BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year',
  'PCMB 1st Year', 'PCMB 2nd Year',
  'PCMC 1st Year', 'PCMC 2nd Year',
  'PCMCS 1st Year', 'PCMCS 2nd Year',
  'COMMERCE 1st Year', 'COMMERCE 2nd Year',
  'ARTS 1st Year', 'ARTS 2nd Year',
  'EBAC 1st Year', 'EBAC 2nd Year',
  'EBAS 1st Year', 'EBAS 2nd Year'
];

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
    totalStudentAchievements: 0,
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
        const approvedStudentsQuery = query(
          collection(db, 'students'),
          where('isApproved', '==', true)
        );
        const studentsSnapshot = await getDocs(approvedStudentsQuery);
        const totalStudents = studentsSnapshot.size;

        const approvedUsersQuery = query(
          collection(db, 'users'),
          where('isApproved', '==', true)
        );
        const usersSnapshot = await getDocs(approvedUsersQuery);
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
        const totalAttendanceToday = attendanceSnapshot.size;

        const pendingCommitteeLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_committee_approval')
        );
        const pendingPrincipalLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_principal_approval')
        );
        const pendingCommitteeSnapshot = await getDocs(pendingCommitteeLeavesQuery);
        const pendingPrincipalSnapshot = await getDocs(pendingPrincipalLeavesQuery);
        const pendingLeaves = pendingCommitteeSnapshot.size + pendingPrincipalSnapshot.size;

        const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
        const totalAchievements = achievementsSnapshot.size;

        const studentAchievementsSnapshot = await getDocs(collection(db, 'studentAchievements'));
        const totalStudentAchievements = studentAchievementsSnapshot.size;

        const timeSlotsSnapshot = await getDocs(collection(db, 'timeSlots'));
        const totalTimeSlots = timeSlotsSnapshot.size;

        const attendanceRate = totalAttendanceToday > 0 ? (presentToday / totalAttendanceToday) * 100 : 0;

        setStats({
          totalStudents,
          totalUsers,
          pendingFacultyApprovals,
          pendingStudentApprovals,
          presentToday,
          pendingLeaves,
          totalAchievements,
          totalStudentAchievements,
          totalTimeSlots,
          attendanceRate,
          departmentStats: {}
        });
      } else if (currentUser?.role === 'timetable_committee') {
        // Fetch timetable committee stats
        const pendingLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_committee_approval')
        );
        const pendingLeavesSnapshot = await getDocs(pendingLeavesQuery);
        const pendingLeaves = pendingLeavesSnapshot.size;

        const timeSlotsSnapshot = await getDocs(collection(db, 'timeSlots'));
        const totalTimeSlots = timeSlotsSnapshot.size;

        const myLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('facultyId', '==', currentUser?.id),
          where('status', 'in', ['pending_committee_approval', 'pending_principal_approval'])
        );
        const myLeavesSnapshot = await getDocs(myLeavesQuery);
        const myPendingLeaves = myLeavesSnapshot.size;

        const myAchievementsQuery = query(
          collection(db, 'achievements'),
          where('facultyId', '==', currentUser?.id)
        );
        const myAchievementsSnapshot = await getDocs(myAchievementsQuery);
        const totalAchievements = myAchievementsSnapshot.size;

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
        });
      } else if (currentUser?.role === 'examination_committee') {
        // Fetch examination committee stats
        const pendingLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_committee_approval')
        );
        const pendingLeavesSnapshot = await getDocs(pendingLeavesQuery);
        const pendingLeaves = pendingLeavesSnapshot.size;

        const myLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('facultyId', '==', currentUser?.id),
          where('status', 'in', ['pending_committee_approval', 'pending_principal_approval'])
        );
        const myLeavesSnapshot = await getDocs(myLeavesQuery);
        const myPendingLeaves = myLeavesSnapshot.size;

        const myAchievementsQuery = query(
          collection(db, 'achievements'),
          where('facultyId', '==', currentUser?.id)
        );
        const myAchievementsSnapshot = await getDocs(myAchievementsQuery);
        const totalAchievements = myAchievementsSnapshot.size;

        const timeSlotsSnapshot = await getDocs(collection(db, 'timeSlots'));
        const totalTimeSlots = timeSlotsSnapshot.size;

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
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = () => {
    switch (currentUser?.role) {
      case 'admin':
        return 'Administrator';
      case 'timetable_committee':
        return 'Timetable Committee';
      case 'examination_committee':
        return 'Examination Committee';
      case 'faculty':
        return 'Faculty';
      default:
        return 'User';
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
      <main className="flex-1 p-4 lg:p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-sm lg:text-base text-gray-600">
              Here's what's happening in your {currentUser?.role === 'admin' ? 'institution' : 'dashboard'} today.
            </p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              Role: {getRoleDisplayName()}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
            ) : currentUser?.role === 'timetable_committee' ? (
              <>
                <StatsCard
                  title="Pending Leave Reviews"
                  value={stats.pendingLeaves}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="Total Time Slots"
                  value={stats.totalTimeSlots}
                  icon={CalendarDays}
                  color="blue"
                />
                <StatsCard
                  title="My Pending Leaves"
                  value={stats.pendingLeaves}
                  icon={FileText}
                  color="orange"
                />
                <StatsCard
                  title="My Achievements"
                  value={stats.totalAchievements}
                  icon={Award}
                  color="purple"
                />
              </>
            ) : currentUser?.role === 'examination_committee' ? (
              <>
                <StatsCard
                  title="Pending Leave Reviews"
                  value={stats.pendingLeaves}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="My Pending Leaves"
                  value={stats.pendingLeaves}
                  icon={FileText}
                  color="orange"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
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
                  title="Faculty Achievements"
                  value={stats.totalAchievements}
                  icon={Award}
                  color="purple"
                />
                <StatsCard
                  title="Student Achievements"
                  value={stats.totalStudentAchievements}
                  icon={Award}
                  color="green"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
                <StatsCard
                  title="Time Slots"
                  value={stats.totalTimeSlots}
                  icon={CalendarDays}
                  color="blue"
                />
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">All Classes Active</p>
                      <p className="text-lg font-bold text-gray-900">{ALL_CLASSES.length} Classes Available</p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• B.com, BBA, BCA (3-year programs)</p>
                    <p>• PCMB, PCMC, PCMCS (2-year programs)</p>
                    <p>• COMMERCE, ARTS, EBAC, EBAS (2-year programs)</p>
                  </div>
                </div>
              </div>

              {/* Approval Alerts */}
              {(stats.pendingFacultyApprovals > 0 || stats.pendingStudentApprovals > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 lg:p-6 mb-4 lg:mb-6">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="text-base lg:text-lg font-medium text-red-900 mb-2">Pending Approvals Require Attention</h3>
                      <div className="space-y-1 text-xs lg:text-sm text-red-800">
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

              {/* Recent Activities - Only show real-time data */}
              {(stats.pendingFacultyApprovals > 0 || stats.pendingStudentApprovals > 0) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    {stats.pendingFacultyApprovals > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <UserCheck className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs lg:text-sm font-medium text-gray-900">
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
                          <p className="text-xs lg:text-sm font-medium text-gray-900">
                            {stats.pendingStudentApprovals} student approval{stats.pendingStudentApprovals > 1 ? 's' : ''} pending
                          </p>
                          <p className="text-xs text-gray-500">Requires your attention</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">System Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-green-600 mb-2">
                      {Math.round(stats.attendanceRate)}%
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600">Today's Attendance Rate</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-blue-600 mb-2">
                      {stats.totalAchievements}
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600">Faculty Achievements</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-yellow-600 mb-2">
                      {stats.totalStudentAchievements}
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600">Student Achievements</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-yellow-600 h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-purple-600 mb-2">
                      {stats.pendingLeaves}
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600">Pending Reviews</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* Committee Specific Content */}
          {(currentUser?.role === 'timetable_committee' || currentUser?.role === 'examination_committee') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
              <div className="flex items-center space-x-3 mb-4">
                {currentUser?.role === 'timetable_committee' ? (
                  <CalendarDays className="h-6 w-6 text-[#002e5d]" />
                ) : (
                  <FileCheck className="h-6 w-6 text-[#002e5d]" />
                )}
                <h3 className="text-base lg:text-lg font-medium text-gray-900">
                  {currentUser?.role === 'timetable_committee' ? 'Timetable Committee' : 'Examination Committee'} Dashboard
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Leave Review Responsibilities</h4>
                  <p className="text-xs lg:text-sm text-blue-800">
                    As a {currentUser?.role === 'timetable_committee' ? 'Timetable Committee' : 'Examination Committee'} member, 
                    you are responsible for reviewing leave applications before they are sent to the Principal for final approval.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
                  <h4 className="font-medium text-green-900 mb-2">Quick Actions</h4>
                  <div className="space-y-2 text-xs lg:text-sm text-green-800">
                    <p>• Review pending leave applications</p>
                    <p>• Approve or reject leave requests</p>
                    <p>• Add comments for Principal review</p>
                    <p>• Monitor leave patterns</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}