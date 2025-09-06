import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { StudentAchievement, LeaveApplication } from '../types';
import { calculateLeaveStats, getLeaveStatusColor, getLOPStatusColor } from '../utils/leaveCalculations';
import { ALL_CLASSES } from '../utils/constants';
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
  Star,
  Calendar as CalendarIcon,
  AlertTriangle,
  Trash2
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
    totalStudentAchievements: 0,
    totalTimeSlots: 0,
    attendanceRate: 0,
    departmentStats: {} as Record<string, { faculty: number; students: number }>,
    remainingLeaves: 0,
    totalLOP: 0,
    totalLeavesUsed: 0
  });
  const [loading, setLoading] = useState(true);
  const [deletingStudents, setDeletingStudents] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, [currentUser]);

  const handleDeleteAllStudents = async () => {
    const confirmMessage = `⚠️ DANGER: This will permanently delete ALL student data from the database.

This action will:
• Delete all student records (${stats.totalStudents} students)
• Delete all attendance records for these students
• Remove all parent contact information
• This action CANNOT be undone

Type "DELETE ALL STUDENTS" to confirm:`;

    const userInput = prompt(confirmMessage);
    
    if (userInput !== "DELETE ALL STUDENTS") {
      if (userInput !== null) {
        toast.error('Deletion cancelled - confirmation text did not match');
      }
      return;
    }

    const finalConfirm = window.confirm(
      `FINAL CONFIRMATION: Are you absolutely sure you want to delete ALL ${stats.totalStudents} students and their data? This action is IRREVERSIBLE.`
    );

    if (!finalConfirm) {
      return;
    }

    setDeletingStudents(true);
    try {
      // Get all student documents
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentIds = studentsSnapshot.docs.map(doc => doc.id);
      
      // Get all attendance records for these students
      const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
      const attendanceToDelete = attendanceSnapshot.docs.filter(doc => 
        studentIds.includes(doc.data().studentId)
      );

      // Delete in batches (Firestore limit is 500 operations per batch)
      const batchSize = 500;
      let totalDeleted = 0;

      // Delete students in batches
      for (let i = 0; i < studentsSnapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = studentsSnapshot.docs.slice(i, i + batchSize);
        
        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        totalDeleted += batchDocs.length;
        
        // Show progress for large datasets
        if (studentsSnapshot.docs.length > 100) {
          toast.loading(`Deleting students... ${totalDeleted}/${studentsSnapshot.docs.length}`, {
            id: 'delete-progress'
          });
        }
      }

      // Delete attendance records in batches
      for (let i = 0; i < attendanceToDelete.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = attendanceToDelete.slice(i, i + batchSize);
        
        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }

      toast.dismiss('delete-progress');
      toast.success(`Successfully deleted ${totalDeleted} students and their attendance records`);
      
      // Refresh dashboard stats
      fetchDashboardStats();
      
    } catch (error) {
      console.error('Error deleting all students:', error);
      toast.error('Failed to delete student data. Please try again.');
    } finally {
      setDeletingStudents(false);
    }
  };

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
          where('status', '==', 'pending_examination_committee_approval')
        );
        const pendingPrincipalLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_principal_approval')
        );
        const pendingCommitteeSnapshot = await getDocs(pendingCommitteeLeavesQuery);
        const pendingPrincipalSnapshot = await getDocs(pendingPrincipalLeavesQuery);
        const pendingTimetableLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_timetable_committee_approval')
        );
        const pendingTimetableSnapshot = await getDocs(pendingTimetableLeavesQuery);
        const pendingLeaves = pendingCommitteeSnapshot.size + pendingPrincipalSnapshot.size + pendingTimetableSnapshot.size;

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
      } else if (currentUser?.role === 'examination_committee') {
        // Fetch examination committee stats
        const pendingLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_examination_committee_approval')
        );
        const pendingLeavesSnapshot = await getDocs(pendingLeavesQuery);
        const pendingLeaves = pendingLeavesSnapshot.size;

        // Fetch my approved leaves for current year
        const myApprovedLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('facultyId', '==', currentUser?.id),
          where('status', '==', 'approved')
        );
        const myApprovedLeavesSnapshot = await getDocs(myApprovedLeavesQuery);
        const myApprovedLeaves = myApprovedLeavesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeaveApplication[];

        const leaveStats = calculateLeaveStats(myApprovedLeaves);

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
          totalStudentAchievements: 0,
          totalTimeSlots,
          attendanceRate: 0,
          departmentStats: {},
          remainingLeaves: leaveStats.remainingLeaves,
          totalLOP: leaveStats.totalLOP,
          totalLeavesUsed: leaveStats.totalLeavesUsed
        });
      } else if (currentUser?.role === 'timetable_committee') {
        // Fetch timetable committee stats
        const pendingLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_timetable_committee_approval')
        );
        const pendingLeavesSnapshot = await getDocs(pendingLeavesQuery);
        const pendingLeaves = pendingLeavesSnapshot.size;

        const timeSlotsSnapshot = await getDocs(collection(db, 'timeSlots'));
        const totalTimeSlots = timeSlotsSnapshot.size;

        // Fetch my approved leaves for current year
        const myApprovedLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('facultyId', '==', currentUser?.id),
          where('status', '==', 'approved')
        );
        const myApprovedLeavesSnapshot = await getDocs(myApprovedLeavesQuery);
        const myApprovedLeaves = myApprovedLeavesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeaveApplication[];

        const leaveStats = calculateLeaveStats(myApprovedLeaves);

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
          totalStudentAchievements: 0,
          totalTimeSlots,
          attendanceRate: 0,
          departmentStats: {},
          remainingLeaves: leaveStats.remainingLeaves,
          totalLOP: leaveStats.totalLOP,
          totalLeavesUsed: leaveStats.totalLeavesUsed
        });
      } else {
        // Fetch faculty stats
        // Fetch my approved leaves for current year
        const myApprovedLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('facultyId', '==', currentUser?.id),
          where('status', '==', 'approved')
        );
        const myApprovedLeavesSnapshot = await getDocs(myApprovedLeavesQuery);
        const myApprovedLeaves = myApprovedLeavesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeaveApplication[];

        const leaveStats = calculateLeaveStats(myApprovedLeaves);

        const myLeavesQuery = query(
          collection(db, 'leaveApplications'),
          where('facultyId', '==', currentUser?.id),
          where('status', 'in', ['pending_examination_committee_approval', 'pending_timetable_committee_approval', 'pending_principal_approval'])
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
          totalStudentAchievements: 0,
          totalTimeSlots,
          attendanceRate: 0,
          departmentStats: {},
          remainingLeaves: leaveStats.remainingLeaves,
          totalLOP: leaveStats.totalLOP,
          totalLeavesUsed: leaveStats.totalLeavesUsed
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
                />
              </>
            ) : currentUser?.role === 'timetable_committee' ? (
              <>
                <StatsCard
                  title="Leave Reviews"
                  value={stats.pendingLeaves}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="Time Slots"
                  value={stats.totalTimeSlots}
                  icon={CalendarDays}
                  color="blue"
                />
                <StatsCard
                  title="Remaining Leaves"
                  value={stats.remainingLeaves}
                  icon={CalendarIcon}
                  color={stats.remainingLeaves >= 8 ? "green" : stats.remainingLeaves >= 4 ? "yellow" : "red"}
                />
                <StatsCard
                  title="Total LOP"
                  value={stats.totalLOP}
                  icon={AlertTriangle}
                  color={stats.totalLOP === 0 ? "green" : stats.totalLOP <= 2 ? "yellow" : "red"}
                />
              </>
            ) : currentUser?.role === 'examination_committee' ? (
              <>
                <StatsCard
                  title="Leave Reviews"
                  value={stats.pendingLeaves}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="Remaining Leaves"
                  value={stats.remainingLeaves}
                  icon={CalendarIcon}
                  color={stats.remainingLeaves >= 8 ? "green" : stats.remainingLeaves >= 4 ? "yellow" : "red"}
                />
                <StatsCard
                  title="Total LOP"
                  value={stats.totalLOP}
                  icon={AlertTriangle}
                  color={stats.totalLOP === 0 ? "green" : stats.totalLOP <= 2 ? "yellow" : "red"}
                />
                <StatsCard
                  title="Classes"
                  value={stats.totalTimeSlots}
                  icon={CalendarDays}
                  color="blue"
                />
              </>
            ) : (
              <>
                <StatsCard
                  title="Remaining Leaves"
                  value={stats.remainingLeaves}
                  icon={CalendarIcon}
                  color={stats.remainingLeaves >= 8 ? "green" : stats.remainingLeaves >= 4 ? "yellow" : "red"}
                />
                <StatsCard
                  title="Total LOP"
                  value={stats.totalLOP}
                  icon={AlertTriangle}
                  color={stats.totalLOP === 0 ? "green" : stats.totalLOP <= 2 ? "yellow" : "red"}
                />
                <StatsCard
                  title="Pending Leaves"
                  value={stats.pendingLeaves}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="Achievements"
                  value={stats.totalAchievements}
                  icon={Award}
                  color="purple"
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
                    <p>• B.com, BBA, BCA (3-year degree programs)</p>
                    <p>• PCMB, PCMC (2-year pre-university programs)</p>
                    <p>• Total: {ALL_CLASSES.length} active classes</p>
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

          {/* Danger Zone - Admin Only */}
          {currentUser?.role === 'admin' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 lg:p-6 mt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
                <h3 className="text-base lg:text-lg font-medium text-red-900">Danger Zone</h3>
              </div>
              
              <div className="bg-white border border-red-300 rounded-lg p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-1">Delete All Student Data</h4>
                    <p className="text-xs text-red-800 mb-2">
                      Permanently delete all students and their attendance records from the database.
                    </p>
                    <div className="text-xs text-red-700 space-y-1">
                      <p>⚠️ This will delete {stats.totalStudents} students</p>
                      <p>⚠️ This will delete all attendance records</p>
                      <p>⚠️ This action cannot be undone</p>
                      <p>⚠️ Large datasets may take several minutes to process</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAllStudents}
                    disabled={deletingStudents || stats.totalStudents === 0}
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm font-medium min-w-[200px]"
                  >
                    {deletingStudents ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete All Students</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Committee Specific Content */}
          {(currentUser?.role === 'timetable_committee' || currentUser?.role === 'examination_committee') && (
            <>
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
                      you are responsible for reviewing leave applications 
                      {currentUser?.role === 'examination_committee' ? ' in the first stage before they go to the Timetable Committee.' : ' in the second stage before they go to the Principal for final approval.'}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
                    <h4 className="font-medium text-green-900 mb-2">Quick Actions</h4>
                    <div className="space-y-2 text-xs lg:text-sm text-green-800">
                      <p>• Review pending leave applications</p>
                      <p>• Approve or reject leave requests</p>
                      <p>• Add comments for next stage review</p>
                      <p>• Monitor leave patterns</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Status Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CalendarIcon className="h-6 w-6 text-[#002e5d]" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900">My Leave Status (Current Year)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalLeavesUsed}/12</div>
                    <p className="text-sm text-blue-800">Leaves Used</p>
                  </div>
                  <div className={`border rounded-lg p-4 text-center ${
                    stats.remainingLeaves >= 8 ? 'bg-green-50 border-green-200' :
                    stats.remainingLeaves >= 4 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-1 ${getLeaveStatusColor(stats.remainingLeaves)}`}>
                      {stats.remainingLeaves}
                    </div>
                    <p className={`text-sm ${getLeaveStatusColor(stats.remainingLeaves)}`}>Remaining Leaves</p>
                  </div>
                  <div className={`border rounded-lg p-4 text-center ${
                    stats.totalLOP === 0 ? 'bg-green-50 border-green-200' :
                    stats.totalLOP <= 2 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-1 ${getLOPStatusColor(stats.totalLOP)}`}>
                      {stats.totalLOP}
                    </div>
                    <p className={`text-sm ${getLOPStatusColor(stats.totalLOP)}`}>LOP Days</p>
                  </div>
                </div>
                
                {stats.totalLOP > 0 && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm font-medium text-red-900">
                        LOP Notice: You have {stats.totalLOP} day(s) of Loss of Pay due to exceeding monthly leave limits.
                      </p>
                    </div>
                    <p className="text-xs text-red-800 mt-1">
                      Monthly limit: 2 leaves per month. Excess leaves are considered LOP.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}



          {/* Faculty Leave Status */}
          {currentUser?.role === 'faculty' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <CalendarIcon className="h-6 w-6 text-[#002e5d]" />
                <h3 className="text-base lg:text-lg font-medium text-gray-900">
                  My Leave Status (Current Year)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalLeavesUsed}/12</div>
                  <p className="text-sm text-blue-800">Leaves Used</p>
                </div>
                <div className={`border rounded-lg p-4 text-center ${
                  stats.remainingLeaves >= 8 ? 'bg-green-50 border-green-200' :
                  stats.remainingLeaves >= 4 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${getLeaveStatusColor(stats.remainingLeaves)}`}>
                    {stats.remainingLeaves}
                  </div>
                  <p className={`text-sm ${getLeaveStatusColor(stats.remainingLeaves)}`}>Remaining Leaves</p>
                </div>
                <div className={`border rounded-lg p-4 text-center ${
                  stats.totalLOP === 0 ? 'bg-green-50 border-green-200' :
                  stats.totalLOP <= 2 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${getLOPStatusColor(stats.totalLOP)}`}>
                    {stats.totalLOP}
                  </div>
                  <p className={`text-sm ${getLOPStatusColor(stats.totalLOP)}`}>LOP Days</p>
                </div>
              </div>
              
              {stats.totalLOP > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium text-red-900">
                      LOP Notice: You have {stats.totalLOP} day(s) of Loss of Pay due to exceeding monthly leave limits.
                    </p>
                  </div>
                  <p className="text-xs text-red-800 mt-1">
                    Monthly limit: 2 leaves per month. Excess leaves are considered LOP.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}