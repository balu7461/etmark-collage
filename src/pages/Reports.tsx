import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AttendanceRecord, Student, LeaveApplication, Achievement } from '../types';
import { BarChart3, Download, Calendar, Users, FileText, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ALL_CLASSES, getYearsForClass } from '../utils/constants';
import { formatStudentIdForDisplay } from '../utils/studentIdValidation';

export function Reports() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const exportAttendanceReport = async () => {
    setLoading(true);
    try {
      // Fetch attendance records
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('date', '>=', dateRange.startDate),
        where('date', '<=', dateRange.endDate),
        orderBy('date', 'desc')
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnapshot.docs.map(doc => doc.data()) as AttendanceRecord[];

      // Fetch students for names
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        rollNumber: String(doc.data().rollNumber || '')
      })) as Student[];

      // Create student lookup
      const studentLookup = studentsData.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {} as Record<string, Student>);

      // Prepare export data
      const exportData = attendanceData.map(record => ({
        'Date': record.date,
        'Student Name': studentLookup[record.studentId]?.name || 'Unknown',
        'Sats No.': studentLookup[record.studentId]?.rollNumber ? formatStudentIdForDisplay(studentLookup[record.studentId].rollNumber) : 'N/A',
        'Class': record.class,
        'Status': record.status === 'present' ? 'Present' :
                  record.status === 'absent' ? 'Absent' :
                  record.status === 'sports' ? 'Sports Activity' :
                  record.status === 'ec' ? 'Extra-Curricular' :
                  record.status,
        'Reason': record.reason || '',
      }));

      // Create and download Excel file
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
      
      const fileName = `attendance-report-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error exporting attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLeaveReport = async () => {
    setLoading(true);
    try {
      const leavesSnapshot = await getDocs(collection(db, 'leaveApplications'));
      const leavesData = leavesSnapshot.docs.map(doc => doc.data()) as LeaveApplication[];

      const exportData = leavesData.map(leave => ({
        'Faculty Name': leave.facultyName,
        'Leave Type': leave.leaveType,
        'Subject': leave.subject,
        'Start Date': leave.startDate,
        'End Date': leave.endDate,
        'Status': leave.status,
        'Applied Date': leave.appliedDate,
        'Reviewed By': leave.reviewedBy || '',
        'Reviewed Date': leave.reviewedDate || '',
        'Comments': leave.comments || '',
        'Description': leave.description
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Report');
      
      const fileName = `leave-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error exporting leave report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAchievementReport = async () => {
    setLoading(true);
    try {
      const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
      const achievementsData = achievementsSnapshot.docs.map(doc => doc.data()) as Achievement[];

      const exportData = achievementsData.map(achievement => ({
        'Faculty Name': achievement.facultyName,
        'Achievement Title': achievement.title,
        'Type': achievement.type,
        'Date': achievement.date,
        'Description': achievement.description,
        'Top Performer': achievement.isTopPerformer ? 'Yes' : 'No',
        'Submitted Date': achievement.submittedDate,
        'File URL': achievement.fileUrl || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Achievement Report');
      
      const fileName = `achievement-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error exporting achievement report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportStudentReport = async () => {
    setLoading(true);
    try {
      // Fetch all students for comprehensive reporting
      const studentsQuery = query(
        collection(db, 'students')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => doc.data()) as Student[];

      // Filter students to only include those from valid classes and years
      const validStudents = studentsData.filter(student => {
        if (!ALL_CLASSES.includes(student.class)) {
          return false;
        }
        const validYears = getYearsForClass(student.class);
        if (validYears.length > 0 && !validYears.includes(student.year)) {
          return false;
        }
        return true;
      });

      const exportData = validStudents.map(student => ({
        'Student Name': student.name,
       'Sats No.': formatStudentIdForDisplay(student.rollNumber),
        'Email': student.email,
        'Class': student.class,
        'Parent Email': student.parentEmail || '',
        'Parent Phone': student.parentPhone || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Student Report');
      
      const fileName = `student-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error exporting student report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and export various reports from the system</p>
          </div>

          {/* Date Range Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Date Range for Attendance Report</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Attendance Report</h3>
                  <p className="text-sm text-gray-600">Export attendance data with filters</p>
                </div>
              </div>
              <button
                onClick={exportAttendanceReport}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Leave Report</h3>
                  <p className="text-sm text-gray-600">Export faculty leave applications</p>
                </div>
              </div>
              <button
                onClick={exportLeaveReport}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Achievement Report</h3>
                  <p className="text-sm text-gray-600">Export faculty achievements data</p>
                </div>
              </div>
              <button
                onClick={exportAchievementReport}
                disabled={loading}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Student Report</h3>
                  <p className="text-sm text-gray-600">Export complete student database</p>
                </div>
              </div>
              <button
                onClick={exportStudentReport}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Report Features</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Attendance Reports Include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Student-wise attendance records</li>
                  <li>• Class-wise attendance summary (all {ALL_CLASSES.length} classes)</li>
                  <li>• Faculty-wise attendance data</li>
                  <li>• Date range filtering</li>
                  <li>• Absence reasons tracking</li>
                  <li>• Parent notification tracking</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Other Reports Include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Faculty leave status tracking</li>
                  <li>• Achievement categorization</li>
                  <li>• Top performer identification</li>
                  <li>• Student & parent contact information</li>
                  <li>• Parent notification data</li>
                  <li>• Multi-class support and analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}