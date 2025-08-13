import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Student, AttendanceRecord, getYearsForClass, classes, subjectsByClass } from '../../types';
import { Calendar, Users, BookOpen, Save, CheckCircle, XCircle, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { sendAbsenteeNotification } from '../../services/emailService';

export function AttendanceForm() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent'; reason?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Reset dependent fields when class changes
  useEffect(() => {
    if (selectedClass) {
      setSelectedYear(''); // Reset year when class changes
      setSelectedSubject(''); // Reset subject when class changes
      setStudents([]); // Clear students when class changes
      setAttendance({}); // Clear attendance when class changes
    }
  }, [selectedClass]);

  // Reset dependent fields when year changes
  useEffect(() => {
    if (selectedYear && selectedClass) {
      setSelectedSubject(''); // Reset subject when year changes
      setStudents([]); // Clear students when year changes
      setAttendance({}); // Clear attendance when year changes
    }
  }, [selectedYear]);

  // Fetch students when both class and year are selected
  useEffect(() => {
    if (selectedClass && selectedYear && selectedSubject) {
      fetchStudents();
    }
  }, [selectedClass, selectedYear, selectedSubject]);

  const fetchStudents = async () => {
    if (!selectedClass || !selectedYear) {
      console.log('⚠️ Cannot fetch students: Class or Year not selected');
      return;
    }

    console.log('🔍 Fetching students for:', { selectedClass, selectedYear });
    setStudentsLoading(true);
    
    try {
      const q = query(
        collection(db, 'students'), 
        where('class', '==', selectedClass),
        where('year', '==', selectedYear),
        where('isApproved', '==', true)
      );
      
      console.log('📡 Executing Firestore query with filters:', {
        class: selectedClass,
        year: selectedYear,
        isApproved: true
      });
      
      const querySnapshot = await getDocs(q, { source: 'server' });
      console.log('📊 Query completed. Documents found:', querySnapshot.size);
      
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      console.log('📋 Students data:', studentsData.map(s => ({ 
        name: s.name, 
        class: s.class, 
        year: s.year,
        rollNumber: s.rollNumber 
      })));
      
      // Sort students by roll number
      studentsData.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
      
      setStudents(studentsData);
      
      // Initialize attendance state - ALL STUDENTS DEFAULT TO PRESENT
      const attendanceState: Record<string, { status: 'present' | 'absent'; reason?: string }> = {};
      studentsData.forEach(student => {
        attendanceState[student.id] = { status: 'present' };
      });
      setAttendance(attendanceState);
      
      if (studentsData.length === 0) {
        console.log('⚠️ No students found for the selected class and year combination');
        toast.warning(`No students found for ${selectedClass} - ${selectedYear}. Please check if students are registered for this class and year.`);
      } else {
        console.log(`✅ Successfully loaded ${studentsData.length} students`);
        toast.success(`Loaded ${studentsData.length} students for ${selectedClass} - ${selectedYear}`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching students:', {
        error,
        selectedClass,
        selectedYear,
        errorMessage: error.message,
        errorCode: error.code
      });
      
      if (error.code === 'permission-denied') {
        toast.error('Permission denied: Check Firestore security rules');
      } else if (error.code === 'unavailable') {
        toast.error('Database unavailable: Check internet connection');
      } else {
        toast.error(`Failed to fetch students: ${error.message}`);
      }
    } finally {
      setStudentsLoading(false);
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

  const sendParentNotifications = async (absentStudents: Student[], subject: string) => {
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
            subject,
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
    
    if (!selectedClass || !selectedYear || !selectedSubject || !currentUser) {
      toast.error('Please select class, year, subject, and date');
      return;
    }

    if (students.length === 0) {
      toast.error('No students found for the selected class and year');
      return;
    }

    console.log('🔄 Starting attendance save operation...', {
      selectedClass,
      selectedYear,
      selectedSubject,
      selectedDate,
      studentsCount: students.length,
      currentUser: currentUser?.name
    });

    setLoading(true);
    try {
      const attendanceRecords: Omit<AttendanceRecord, 'id'>[] = students.map(student => ({
        studentId: student.id,
        date: selectedDate,
        status: attendance[student.id]?.status || 'present',
        subject: selectedSubject,
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        reason: attendance[student.id]?.reason || '',
        class: selectedClass,
        year: selectedYear // Ensure year is always saved
      }));

      console.log('📝 Attendance records to be saved:', attendanceRecords.length);

      // Save attendance records
      for (const record of attendanceRecords) {
        console.log('💾 Saving attendance record:', {
          studentId: record.studentId,
          class: record.class,
          year: record.year,
          subject: record.subject,
          status: record.status
        });
        await addDoc(collection(db, 'attendance'), record);
      }

      const absentStudents = students.filter(student => 
        attendance[student.id]?.status === 'absent'
      );

      console.log('✅ Attendance saved successfully!', {
        totalRecords: attendanceRecords.length,
        absentCount: absentStudents.length
      });

      toast.success(`Attendance marked successfully! ${absentStudents.length} students marked absent.`);
      
      // Send parent notifications for absent students
      if (absentStudents.length > 0) {
        const studentsWithParentEmail = absentStudents.filter(student => student.parentEmail);
        
        if (studentsWithParentEmail.length > 0) {
          toast.loading(`Sending notifications to ${studentsWithParentEmail.length} parent(s)...`);
          await sendParentNotifications(studentsWithParentEmail, selectedSubject);
        } else {
          toast.info('No parent email addresses found for absent students');
        }
      }
      
      // Reset form
      setAttendance({});
      setSelectedClass('');
      setSelectedYear('');
      setSelectedSubject('');
      setStudents([]);
      
    } catch (error) {
      console.error('❌ Error saving attendance:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        selectedClass,
        selectedYear,
        selectedSubject
      });
      
      if (error.code === 'permission-denied') {
        toast.error('Permission denied: Check Firestore security rules');
      } else if (error.code === 'unavailable') {
        toast.error('Database unavailable: Check internet connection');
      } else {
        toast.error(`Failed to save attendance: ${error.message}`);
      }
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
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
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
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={!selectedClass}
              >
                <option value="">Select Year</option>
                {selectedClass && getYearsForClass(selectedClass).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {!selectedClass && (
                <p className="text-xs text-gray-500 mt-1">Select a class first</p>
              )}
            </div>

            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={!selectedClass}
              >
                <option value="">Select Subject</option>
                {selectedClass && subjectsByClass[selectedClass as keyof typeof subjectsByClass]?.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {!selectedClass && (
                <p className="text-xs text-gray-500 mt-1">Select a class first</p>
              )}
            </div>
          </div>
        </div>

        {/* Students Loading State */}
        {studentsLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-800">Loading students for {selectedClass} - {selectedYear}...</p>
            </div>
          </div>
        )}

        {/* No Students Found Message */}
        {!studentsLoading && selectedClass && selectedYear && selectedSubject && students.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">No students found</p>
                <p className="text-yellow-700 text-sm">
                  No approved students found for {selectedClass} - {selectedYear}. 
                  Please check if students are registered and approved for this class and year combination.
                </p>
              </div>
            </div>
          </div>
        )}

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

            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Students - {selectedClass} {selectedYear} - {selectedSubject} ({students.length})
                </h3>
                <div className="ml-auto text-sm text-green-600 font-medium">
                  ✓ All students default to PRESENT
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">Sats No.: {student.rollNumber}</p>
                      {student.parentEmail && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600 mt-1">
                          <Mail className="h-3 w-3" />
                          <span>Parent: {student.parentEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        <label className="flex items-center transform transition-all duration-200 hover:scale-105">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id]?.status === 'present'}
                            onChange={() => handleAttendanceChange(student.id, 'present')}
                            className="mr-2 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-green-600 font-medium">Present</span>
                        </label>
                        <label className="flex items-center transform transition-all duration-200 hover:scale-105">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id]?.status === 'absent'}
                            onChange={() => handleAttendanceChange(student.id, 'absent')}
                            className="mr-2 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-red-600 font-medium">Absent</span>
                        </label>
                      </div>

                      {attendance[student.id]?.status === 'absent' && (
                        <input
                          type="text"
                          placeholder="Reason (optional)"
                          value={attendance[student.id]?.reason || ''}
                          onChange={(e) => handleReasonChange(student.id, e.target.value)}
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {students.length > 0 && (
          <button
            type="submit"
            disabled={loading || sendingEmails}
            className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105"
          >
            {loading || sendingEmails ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save {selectedSubject} Attendance & Send Notifications</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}