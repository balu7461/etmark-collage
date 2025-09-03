import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Student, AttendanceRecord } from '../../types';
import { Calendar, Users, BookOpen, Save, CheckCircle, XCircle, Mail, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ALL_CLASSES, TIME_SLOTS, getYearsForClass, subjectsByClassAndYear } from '../../utils/constants';

export function AttendanceForm() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent' | 'sports' | 'ec'; reason?: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass && selectedYear) {
      console.log('🔍 Fetching students for:', { selectedClass, selectedYear });
      fetchStudents();
    }
  }, [selectedClass, selectedYear]);

  const fetchStudents = async () => {
    console.log('📡 Starting fetchStudents with params:', {
      selectedClass,
      selectedYear,
      timestamp: new Date().toISOString()
    });
    
    try {
      const q = query(
        collection(db, 'students'), 
        where('class', '==', selectedClass),
        where('year', '==', selectedYear),
        where('isApproved', '==', true)
      );
      
      console.log('🔎 Firestore query created for:', {
        class: selectedClass,
        year: selectedYear,
        isApproved: true
      });
      
      const querySnapshot = await getDocs(q, { source: 'server' });
      
      console.log('📊 Firestore query results:', {
        totalDocuments: querySnapshot.size,
        isEmpty: querySnapshot.empty
      });
      
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      console.log('📋 Raw students data from Firestore:', {
        count: studentsData.length,
        students: studentsData.map(s => ({
          name: s.name,
          class: s.class,
          year: s.year,
          rollNumber: s.rollNumber,
          isApproved: s.isApproved
        }))
      });
      
      setStudents(studentsData);
      
      // Initialize attendance state - ALL STUDENTS DEFAULT TO PRESENT
      const attendanceState: Record<string, { status: 'present' | 'absent' | 'sports' | 'ec'; reason?: string }> = {};
      studentsData.forEach(student => {
        attendanceState[student.id] = { status: 'present' };
      });
      setAttendance(attendanceState);
      
      console.log('✅ Students state updated:', {
        studentsCount: studentsData.length,
        attendanceStateKeys: Object.keys(attendanceState).length
      });
      
    } catch (error) {
      console.error('❌ DETAILED ERROR fetching students:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        selectedClass,
        selectedYear,
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to fetch students');
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'sports' | 'ec') => {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedYear || !selectedTimeSlot || !selectedSubject || !currentUser) {
      toast.error('Please select class, year, time slot, subject, and date');
      return;
    }

    setLoading(true);
    try {
      const attendanceRecords: Omit<AttendanceRecord, 'id'>[] = students.map(student => ({
        studentId: student.id,
        date: selectedDate,
        status: attendance[student.id]?.status || 'present',
        subject: selectedSubject,
        timeSlot: selectedTimeSlot,
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

      toast.success(`Attendance marked successfully! ${absentStudents.length} students marked absent. Data saved to database.`);
      
      // Reset form
      setAttendance({});
      setSelectedClass('');
      setSelectedYear('');
      setSelectedTimeSlot('');
      setSelectedSubject('');
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
    const absentCount = students.filter(student => 
      attendance[student.id]?.status === 'absent'
    ).length;
    const sportsCount = students.filter(student => 
      attendance[student.id]?.status === 'sports'
    ).length;
    const ecCount = students.filter(student => 
      attendance[student.id]?.status === 'ec'
    ).length;
    
    return { totalStudents, presentCount, absentCount, sportsCount, ecCount };
  };

  const stats = getAttendanceStats();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="h-6 w-6 text-[#002e5d]" />
        <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-5 gap-4">
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
                {ALL_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={!selectedClass}
              >
                <option value="">Select Year</option>
                {getYearsForClass(selectedClass).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select Time</option>
                {TIME_SLOTS.map(slot => (
                  <option key={slot.label} value={slot.label}>{slot.label}</option>
                ))}
              </select>
            </div>

            <div className="transform transition-all duration-200 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={!selectedClass || !selectedYear}
              >
                <option value="">Select Subject</option>
                {selectedClass && selectedYear ? (
                  subjectsByClassAndYear[selectedClass as keyof typeof subjectsByClassAndYear] ? (
                    (subjectsByClassAndYear[selectedClass as keyof typeof subjectsByClassAndYear] as any)[selectedYear]?.map((subj: string) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))
                  ) : (
                    // For classes without predefined subjects, allow manual entry
                    <>
                      <option value="General Class">General Class</option>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Lab">Lab</option>
                    </>
                  )
                ) : (
                  <option value="" disabled>Select Class and Year First</option>
                )}
              </select>
            </div>
          </div>

          {/* Stats Card */}
          {students.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 lg:p-4 border border-blue-100 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900 text-sm lg:text-base">Attendance Summary</h3>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-900 text-sm lg:text-base">{stats.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Present:
                  </span>
                  <span className="font-semibold text-green-700 text-sm lg:text-base">{stats.presentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Absent:
                  </span>
                  <span className="font-semibold text-red-700 text-sm lg:text-base">{stats.absentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-blue-600 flex items-center">
                    <Trophy className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Sports:
                  </span>
                  <span className="font-semibold text-blue-700 text-sm lg:text-base">{stats.sportsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-purple-600 flex items-center">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    EC:
                  </span>
                  <span className="font-semibold text-purple-700 text-sm lg:text-base">{stats.ecCount}</span>
                </div>
                {selectedTimeSlot && (
                  <div className="pt-1 lg:pt-2 border-t border-blue-200">
                    <div className="flex items-center space-x-1 text-xs lg:text-sm text-blue-600">
                      <Clock className="h-3 w-3" />
                      <span>{selectedTimeSlot}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">
                  Students - {selectedClass} ({selectedYear}) - {selectedSubject}
                </h3>
                <span className="text-sm text-gray-500">
                  {selectedTimeSlot} on {selectedDate}
                </span>
              </div>
              
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200 hover:shadow-md transition-all attendance-student-card">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0 attendance-student-info">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base student-name">{student.name}</h4>
                        <p className="text-xs lg:text-sm text-gray-600 student-details">Roll No: {student.rollNumber}</p>
                        {student.parentEmail && (
                          <p className="text-xs text-gray-500 flex items-center mt-1 student-details">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-32 lg:max-w-none">{student.parentEmail}</span>
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 attendance-controls">
                        <div className="grid grid-cols-2 lg:flex gap-2 lg:space-x-2 w-full lg:w-auto attendance-radio-group">
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className={`px-2 lg:px-3 py-2 lg:py-1 rounded-lg lg:rounded-full text-xs lg:text-sm font-medium transition-all min-h-[44px] lg:min-h-auto flex items-center justify-center ${
                              attendance[student.id]?.status === 'present'
                                ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-md'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-green-50'
                            }`}
                          >
                            <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 inline mr-1" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className={`px-2 lg:px-3 py-2 lg:py-1 rounded-lg lg:rounded-full text-xs lg:text-sm font-medium transition-all min-h-[44px] lg:min-h-auto flex items-center justify-center ${
                              attendance[student.id]?.status === 'absent'
                                ? 'bg-red-100 text-red-800 border-2 border-red-300 shadow-md'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-red-50'
                            }`}
                          >
                            <XCircle className="h-3 w-3 lg:h-4 lg:w-4 inline mr-1" />
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'sports')}
                            className={`px-2 lg:px-3 py-2 lg:py-1 rounded-lg lg:rounded-full text-xs lg:text-sm font-medium transition-all min-h-[44px] lg:min-h-auto flex items-center justify-center ${
                              attendance[student.id]?.status === 'sports'
                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-md'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-blue-50'
                            }`}
                          >
                            <Trophy className="h-3 w-3 lg:h-4 lg:w-4 inline mr-1" />
                            Sports
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'ec')}
                            className={`px-2 lg:px-3 py-2 lg:py-1 rounded-lg lg:rounded-full text-xs lg:text-sm font-medium transition-all min-h-[44px] lg:min-h-auto flex items-center justify-center ${
                              attendance[student.id]?.status === 'ec'
                                ? 'bg-purple-100 text-purple-800 border-2 border-purple-300 shadow-md'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-purple-50'
                            }`}
                          >
                            <Star className="h-3 w-3 lg:h-4 lg:w-4 inline mr-1" />
                            EC
                          </button>
                        </div>

                        {(attendance[student.id]?.status === 'absent' || 
                          attendance[student.id]?.status === 'sports' || 
                          attendance[student.id]?.status === 'ec') && (
                          <input
                            type="text"
                            placeholder={
                              attendance[student.id]?.status === 'absent' ? 'Reason (optional)' :
                              attendance[student.id]?.status === 'sports' ? 'Sports activity (optional)' :
                              'EC activity (optional)'
                            }
                            value={attendance[student.id]?.reason || ''}
                            onChange={(e) => handleReasonChange(student.id, e.target.value)}
                            className="w-full lg:w-40 px-2 py-2 lg:py-1 text-xs lg:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all attendance-reason-input"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save Attendance</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}