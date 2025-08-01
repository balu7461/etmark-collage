import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, AttendanceRecord } from '../types';
import { Search, User, Calendar, CheckCircle, XCircle, BarChart3, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export function StudentOverallAttendance() {
  const [usn, setUsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [attendanceData, setAttendanceData] = useState<{
    totalPresent: number;
    totalAbsent: number;
    attendancePercentage: number;
    totalDays: number;
    records: AttendanceRecord[];
  } | null>(null);

  const searchStudentAttendance = async () => {
    if (!usn.trim()) {
      toast.error('Please enter a valid USN/Roll Number');
      return;
    }

    setLoading(true);
    try {
      // Search for student by roll number
      const studentQuery = query(
        collection(db, 'students'),
        where('rollNumber', '==', usn.trim()),
        where('isApproved', '==', true)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        toast.error('Student not found with this USN/Roll Number');
        setStudentData(null);
        setAttendanceData(null);
        return;
      }

      const student = {
        id: studentSnapshot.docs[0].id,
        ...studentSnapshot.docs[0].data()
      } as Student;

      setStudentData(student);

      // Fetch all attendance records for this student
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', student.id)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      
      const records = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

      // Calculate attendance statistics
      const totalDays = records.length;
      const totalPresent = records.filter(record => record.status === 'present').length;
      const totalAbsent = records.filter(record => record.status === 'absent').length;
      const attendancePercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

      setAttendanceData({
        totalPresent,
        totalAbsent,
        attendancePercentage,
        totalDays,
        records: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      });

      toast.success('Student attendance data loaded successfully!');

    } catch (error) {
      console.error('Error fetching student attendance:', error);
      toast.error('Failed to fetch student attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchStudentAttendance();
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBgColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-100 border-green-200';
    if (percentage >= 75) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-4 lg:p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Student Overall Attendance</h1>
            <p className="text-sm lg:text-base text-gray-600">
              Search for a student's complete attendance record by entering their USN/Roll Number
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="h-5 w-5 text-gray-600" />
              <h3 className="text-base lg:text-lg font-medium text-gray-900">Search Student</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter USN/Roll Number (e.g., BCA001, COM123)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                />
              </div>
              <button
                onClick={searchStudentAttendance}
                disabled={loading}
                className="bg-[#002e5d] text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm lg:text-base min-h-[44px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Student Information */}
          {studentData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="text-base lg:text-lg font-medium text-gray-900">Student Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Name</p>
                  <p className="text-sm lg:text-base font-semibold text-gray-900">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">USN/Roll Number</p>
                  <p className="text-sm lg:text-base font-semibold text-gray-900">{studentData.rollNumber}</p>
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Class</p>
                  <p className="text-sm lg:text-base font-semibold text-gray-900">{studentData.class}</p>
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Year</p>
                  <p className="text-sm lg:text-base font-semibold text-gray-900">{studentData.year || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Statistics */}
          {attendanceData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 transform transition-all duration-200 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Total Days</p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900">{attendanceData.totalDays}</p>
                    </div>
                    <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 transform transition-all duration-200 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Present</p>
                      <p className="text-2xl lg:text-3xl font-bold text-green-600">{attendanceData.totalPresent}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 transform transition-all duration-200 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Absent</p>
                      <p className="text-2xl lg:text-3xl font-bold text-red-600">{attendanceData.totalAbsent}</p>
                    </div>
                    <XCircle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
                  </div>
                </div>
                
                <div className={`rounded-xl shadow-sm border p-4 lg:p-6 transform transition-all duration-200 hover:scale-105 ${getAttendanceBgColor(attendanceData.attendancePercentage)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Attendance %</p>
                      <p className={`text-2xl lg:text-3xl font-bold ${getAttendanceColor(attendanceData.attendancePercentage)}`}>
                        {attendanceData.attendancePercentage}%
                      </p>
                    </div>
                    <BarChart3 className={`h-6 w-6 lg:h-8 lg:w-8 ${getAttendanceColor(attendanceData.attendancePercentage)}`} />
                  </div>
                </div>
              </div>

              {/* Attendance Status Message */}
              <div className={`rounded-xl border p-4 mb-6 ${getAttendanceBgColor(attendanceData.attendancePercentage)}`}>
                <div className="flex items-center space-x-3">
                  {attendanceData.attendancePercentage >= 85 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : attendanceData.attendancePercentage >= 75 ? (
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className={`font-medium ${getAttendanceColor(attendanceData.attendancePercentage)}`}>
                      {attendanceData.attendancePercentage >= 85 
                        ? 'Excellent Attendance' 
                        : attendanceData.attendancePercentage >= 75 
                        ? 'Good Attendance' 
                        : 'Poor Attendance - Needs Improvement'}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600">
                      {attendanceData.attendancePercentage >= 85 
                        ? 'Student has maintained excellent attendance record.' 
                        : attendanceData.attendancePercentage >= 75 
                        ? 'Student has good attendance but can improve further.' 
                        : 'Student attendance is below minimum requirement. Immediate attention needed.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Attendance Records */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-base lg:text-lg font-medium text-gray-900">Recent Attendance Records</h3>
                  <p className="text-xs lg:text-sm text-gray-600">Showing latest 10 records</p>
                </div>
                
                <div className="overflow-x-auto table-container">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Faculty</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceData.records.slice(0, 10).map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">{record.date}</td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">{record.subject}</td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900 hidden sm:table-cell truncate max-w-32 lg:max-w-none">
                            {record.facultyName}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500 hidden md:table-cell">
                            {record.reason || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {attendanceData.records.length > 10 && (
                  <div className="px-4 lg:px-6 py-3 bg-gray-50 text-xs lg:text-sm text-gray-600 text-center">
                    Showing 10 of {attendanceData.records.length} total records
                  </div>
                )}
              </div>
            </>
          )}

          {/* No Data Message */}
          {!studentData && !loading && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Search for Student Attendance</h3>
              <p className="text-sm lg:text-base text-gray-600">Enter a student's USN/Roll Number to view their complete attendance record.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}