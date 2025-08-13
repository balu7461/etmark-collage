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
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [subject, setSubject] = useState('');
  const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent'; reason?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);

  const classes = ['B.com', 'BBA', 'BCA', 'PCMB', 'PCMC', 'EBAC', 'EBAS'];
  
  const subjectsByClass = {
    'B.com': ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics', 'Computer Applications'],
    'BBA': ['Business Administration', 'Marketing', 'Finance', 'Human Resources', 'Operations Management', 'Business Ethics'],
    'BCA': ['Programming in C', 'Data Structures', 'Database Management', 'Web Development', 'Software Engineering', 'Computer Networks'],
    'PCMB': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    'PCMC': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    'EBAC': ['Economics', 'Business Studies', 'Accountancy', 'Computer Science'],
    'EBAS': ['Economics', 'Business Studies', 'Accountancy', 'Statistics']
  };

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const q = query(
        collection(db, 'students'), 
        where('class', '==', selectedClass),
        where('isApproved', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      setStudents(studentsData);
      
      // Initialize attendance state
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
    
    if (!selectedClass || !subject || !currentUser) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const attendanceRecords: Omit<AttendanceRecord, 'id'>[] = students.map(student => ({
        studentId: student.id,
        date: selectedDate,
        status: attendance[student.id]?.status || 'present',
        subject,
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        reason: attendance[student.id]?.reason || '',
        class: selectedClass
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
      setSubject('');
      
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
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Class
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

          <div className="transform transition-all duration-200 hover:scale-105">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            {selectedClass ? (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select Subject</option>
                {subjectsByClass[selectedClass as keyof typeof subjectsByClass]?.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            ) : (
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              >
                <option value="">Select Class First</option>
              </select>
            )}
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
                  </div>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-900">{stats.presentCount}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Absent</p>
                    <p className="text-2xl font-bold text-red-900">{stats.absentCount}</p>
                  </div>
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Students ({students.length})
                </h3>
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
                <span>Save Attendance & Send Notifications</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}