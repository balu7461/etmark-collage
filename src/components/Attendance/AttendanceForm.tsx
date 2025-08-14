import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Student, AttendanceRecord } from '../../types';
import { Calendar, Users, BookOpen, Save, CheckCircle, XCircle, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { sendAbsenteeNotification } from '../../services/emailService';

export function AttendanceForm() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent'; reason?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);

  const classes = ['B.com', 'BBA', 'BCA', 'PCMB', 'PCMC', 'EBAC', 'EBAS'];
  
  const getYearsForClass = (selectedClass: string) => {
    if (['B.com', 'BBA', 'BCA'].includes(selectedClass)) {
      return ['1st Year', '2nd Year', '3rd Year'];
    } else if (['PCMB', 'PCMC', 'EBAC', 'EBAS'].includes(selectedClass)) {
      return ['1st Year', '2nd Year'];
    }
    return [];
  };

  useEffect(() => {
    if (selectedClass && selectedYear) {
      fetchStudents();
    }
  }, [selectedClass, selectedYear]);

  const fetchStudents = async () => {
    try {
      const q = query(
        collection(db, 'students'), 
        where('class', '==', selectedClass),
        where('year', '==', selectedYear),
        where('isApproved', '==', true)
      );
      const querySnapshot = await getDocs(q, { source: 'server' });
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      setStudents(studentsData);
      
      // Initialize attendance state - ALL STUDENTS DEFAULT TO PRESENT
      const attendanceState: Record<string, { status: 'present' | 'absent'; reason?: string }> = {};
      studentsData.forEach(student => {
        attendanceState[student.id] = { status: 'present' };
      });
      setAttendance(attendanceState);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], reason }
    }));
  };

  const sendParentNotifications = async (absentStudents: Student[]) => {
    setSendingEmails(true);
    let successCount = 0;
    let failureCount = 0;

    for (const student of absentStudents) {
      if (student.parentEmail) {
        try {
          await sendAbsenteeNotification(
            student.parentEmail,
            student.name,
            selectedDate,
            `Class Attendance - ${selectedClass}`,
            currentUser?.name || 'Faculty',
            attendance[student.id]?.reason
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to send email to ${student.parentEmail}:`, error);
          failureCount++;
        }
      }
    }

    setSendingEmails(false);

    if (successCount > 0) {
      toast.success(`${successCount} parent notification(s) sent successfully!`);
    }
    if (failureCount > 0) {
      toast.error(`Failed to send ${failureCount} notification(s)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedYear || !currentUser) {
      toast.error('Please select class, year, and date');
      return;
    }

    setLoading(true);
    try {
      const attendanceRecords: Omit<AttendanceRecord, 'id'>[] = students.map(student => ({
        studentId: student.id,
        date: selectedDate,
        status: attendance[student.id]?.status || 'present',
        subject: `Class Attendance - ${selectedClass} (${selectedYear})`,
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        reason: attendance[student.id]?.reason || '',
        class: selectedClass,
        year: selectedYear
      }));

      // Save attendance records
      for (const record of attendanceRecords) {
        await addDoc(collection(db, 'attendance'), record);
      }

      const absentStudents = students.filter(student => 
        attendance[student.id]?.status === 'absent'
      );

      toast.success(`Attendance marked successfully! ${absentStudents.length} students marked absent.`);
      
      // Send parent notifications for absent students
      if (absentStudents.length > 0) {
        const studentsWithParentEmail = absentStudents.filter(student => student.parentEmail);
        
        if (studentsWithParentEmail.length > 0) {
          toast.loading(`Sending notifications to ${studentsWithParentEmail.length} parent(s)...`);
          await sendParentNotifications(studentsWithParentEmail);
        } else {
          toast.info('No parent email addresses found for absent students');
        }
      }
      
      // Reset form
      setAttendance({});
      setSelectedClass('');
      setSelectedYear('');
      setStudents([]);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const presentCount = students.filter(student => 
      attendance[student.id]?.status === 'present'
    ).length;
    const absentCount = totalStudents - presentCount;
    
    return { totalStudents, presentCount, absentCount };
  };

  const stats = getAttendanceStats();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="h-6 w-6 text-[#002e5d]" />
        <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
      </div>

      {/* Email Service Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Automatic Parent Notifications</h4>
            <p className="text-sm text-blue-800">
              Parents will automatically receive email notifications from <strong>hiddencave168@gmail.com</strong> when their child is marked absent.
              Make sure parent email addresses are correctly entered in student records.
            </p>
              <div className="ml-auto text-xs sm:text-sm text-green-600 font-medium hidden sm:block">
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedYear(''); // Reset year when class changes
                          className="mr-2 text-green-600 focus:ring-green-500"
                }}
                        <span className="text-green-600 font-medium text-sm">Present</span>
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
                          className="mr-2 text-red-600 focus:ring-red-500"

                        <span className="text-red-600 font-medium text-sm">Absent</span>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={!selectedClass}
                        className="w-full sm:w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                <option value="">Select Year</option>
                {getYearsForClass(selectedClass).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {students.length > 0 && (
          <>
            {/* Attendance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
                    <p className="text-xs text-blue-700">{selectedClass} - {selectedYear}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-900">{stats.presentCount}</p>
                    <p className="text-xs text-green-700">Default: All Present</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Absent</p>
                    <p className="text-2xl font-bold text-red-900">{stats.absentCount}</p>
                    <p className="text-xs text-red-700">Mark as needed</p>
                  </div>
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Students - {selectedClass} {selectedYear} ({students.length})
                </h3>
                <div className="ml-auto text-sm text-green-600 font-medium">
                  ✓ All students default to PRESENT
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{student.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Sats No.: {student.rollNumber}</p>
                      </div>
                      {student.parentEmail && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-48 sm:max-w-none">Parent: {student.parentEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 ml-4">
                      <div className="flex space-x-2 flex-shrink-0">
                        <label className="flex items-center transform transition-all duration-200 hover:scale-105">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id]?.status === 'present'}
                            onChange={() => handleAttendanceChange(student.id, 'present')}
                            className="mr-1 sm:mr-2 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-green-600 font-medium text-xs sm:text-sm">Present</span>
                        </label>
                        <label className="flex items-center transform transition-all duration-200 hover:scale-105">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id]?.status === 'absent'}
                            onChange={() => handleAttendanceChange(student.id, 'absent')}
                            className="mr-1 sm:mr-2 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-red-600 font-medium text-xs sm:text-sm">Absent</span>
                        </label>
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="space-y-1 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2 mb-2">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate pr-2">{student.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Sats No.: {student.rollNumber}</p>
                          placeholder="Reason (optional)"
                          value={attendance[student.id]?.reason || ''}
                      <div className="flex items-center space-x-1 text-xs text-blue-600 truncate">
                          className="w-full sm:w-32 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        <span className="truncate">Parent: {student.parentEmail}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:ml-4">
                    <div className="flex justify-center sm:justify-start space-x-4 sm:space-x-2 flex-shrink-0">
            type="submit"
            disabled={loading || sendingEmails}
            className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105"
          >
            {loading || sendingEmails ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Attendance & Send Notifications</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}