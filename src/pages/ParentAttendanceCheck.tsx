import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, AttendanceRecord } from '../types';
import { Search, User, Calendar, CheckCircle, XCircle, Clock, BookOpen, GraduationCap, AlertCircle, Phone, Mail, ArrowLeft, Trophy, Star } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { processStudentId, generateSearchTerms, formatStudentIdForDisplay } from '../utils/studentIdValidation';
import { normalizeStudentClassAndYear, isValidStudentData } from '../utils/dataNormalization';

export function ParentAttendanceCheck() {
  const [satsNo, setSatsNo] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchAttendance = async () => {
    if (!satsNo.trim()) {
      toast.error('Please enter a Sats No.');
      return;
    }

    // Process and validate the student ID
    const idProcessingResult = processStudentId(satsNo);
    
    if (idProcessingResult.status === 'Invalid') {
      toast.error(`Invalid Sats No. format: ${idProcessingResult.notes}`);
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const standardizedId = idProcessingResult.standardizedVersion;
    const searchTerms = generateSearchTerms(satsNo);
    
    console.log('🔍 Student ID processing result:', {
      original: satsNo,
      standardized: standardizedId,
      formatType: idProcessingResult.formatType,
      searchTerms,
      notes: idProcessingResult.notes
    });

    setLoading(true);
    setHasSearched(true);
    
    try {
      let studentSnapshot: any = null;
      
      // Try each search term until we find a match
      for (const searchTerm of searchTerms) {
        console.log('📡 Parent portal searching with term:', searchTerm);
        
        const studentQuery = query(
          collection(db, 'students'),
          where('rollNumber', '==', searchTerm)
        );
        studentSnapshot = await getDocs(studentQuery);
        
        if (!studentSnapshot.empty) {
          console.log('✅ Found student with search term:', searchTerm);
          break;
        }
      }
      
      console.log('📊 First search attempt results:', {
        searchTerms,
        documentsFound: studentSnapshot.size,
        isEmpty: studentSnapshot.empty
      });
      
      // If no match found with direct queries, try comprehensive search
      if (studentSnapshot.empty) {
        console.log('🔄 No exact match found, trying comprehensive search...');
        
        const allStudentsQuery = query(collection(db, 'students'));
        const allStudentsSnapshot = await getDocs(allStudentsQuery);
        
        console.log('📊 Fetched all students for search:', allStudentsSnapshot.size);
        
        // Find student with case-insensitive roll number match
        const matchingDoc = allStudentsSnapshot.docs.find(doc => {
          const studentData = doc.data();
          const rollNumber = String(studentData.rollNumber || '').trim().toUpperCase();
          const matches = searchTerms.some(term => rollNumber === term);
          
          if (matches) {
            console.log('✅ Found matching student in comprehensive search:', {
              name: studentData.name,
              rollNumber: studentData.rollNumber,
              normalizedRollNumber: rollNumber,
              searchTerms
            });
          }
          
          return matches;
        });
        
        if (matchingDoc) {
          // Create a mock snapshot with the found document
          studentSnapshot = {
            empty: false,
            size: 1,
            docs: [matchingDoc]
          } as any;
        }
      }

      if (studentSnapshot.empty) {
        console.log('❌ No student found with Sats No.:', standardizedId);
        toast.error('Student not found with this Sats No. Please check and try again.');
        setStudentData(null);
        setAttendanceData([]);
        return;
      }

      const student = {
        id: studentSnapshot.docs[0].id,
        ...studentSnapshot.docs[0].data(),
        rollNumber: String(studentSnapshot.docs[0].data().rollNumber || '')
      } as Student;

      console.log('👤 Found student:', {
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        year: student.year,
        id: student.id
      });

      // Normalize student data to handle class/year inconsistencies
      const normalizedStudent = normalizeStudentClassAndYear(student);
      
      console.log('🔧 Normalized student data:', {
        original: { class: student.class, year: student.year },
        normalized: { class: normalizedStudent.class, year: normalizedStudent.year }
      });
      
      // Log validation status but don't block display
      const isValid = isValidStudentData(normalizedStudent);
      if (!isValid) {
        console.warn('⚠️ Student data validation warning (but still displaying):', {
          name: student.name,
          rollNumber: student.rollNumber,
          originalClass: student.class,
          originalYear: student.year,
          normalizedClass: normalizedStudent.class,
          normalizedYear: normalizedStudent.year
        });
      }
      
      setStudentData(normalizedStudent);

      // Fetch attendance records for the selected date
      console.log('📅 Fetching attendance records for date:', selectedDate);
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', student.id),
        where('date', '==', selectedDate)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      
      console.log('📊 Attendance records found for date:', {
        date: selectedDate,
        recordsFound: attendanceSnapshot.size
      });
      
      const records = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

      // Sort by time slot
      records.sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
      
      setAttendanceData(records);

      if (records.length === 0) {
        toast(`Student found: ${student.name}, but no attendance records found for ${selectedDate}.`);
      } else {
        toast.success(`Found ${records.length} attendance record(s) for ${student.name} on ${selectedDate}`);
      }

    } catch (error) {
      console.error('❌ DETAILED ERROR fetching attendance:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        searchTerm: satsNo.trim(),
        selectedDate,
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to fetch attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAttendance();
    }
  };

  const getAttendanceStats = () => {
    const totalClasses = attendanceData.length;
    const presentCount = attendanceData.filter(record => record.status === 'present').length;
    const absentCount = attendanceData.filter(record => record.status === 'absent').length;
    const sportsCount = attendanceData.filter(record => record.status === 'sports').length;
    const ecCount = attendanceData.filter(record => record.status === 'ec').length;
    // Sports and EC count as excused attendance (positive towards percentage)
    const excusedCount = presentCount + sportsCount + ecCount;
    const attendancePercentage = totalClasses > 0 ? Math.round((excusedCount / totalClasses) * 100) : 0;
    
    return { totalClasses, presentCount, absentCount, sportsCount, ecCount, attendancePercentage };
  };

  const stats = getAttendanceStats();

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

  const resetSearch = () => {
    setSatsNo('');
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setStudentData(null);
    setAttendanceData([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#002e5d] p-2 rounded-lg">
                <img 
                  src="/trinity-logo.png" 
                  alt="Trinity Track Logo" 
                  className="h-8 w-8 object-contain filter brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="text-white text-sm font-bold">Trinity</div>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Trinity Track</h1>
                <p className="text-sm text-gray-600">Parent Attendance Portal</p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center space-x-2 text-[#002e5d] hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Login</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Check Your Child's Attendance
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your child's Sats No. and select a date to view their attendance record
            </p>

            {/* Search Form */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Sats No. *
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={satsNo}
                      onChange={(e) => setSatsNo(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., 265212747 or U01IQ25M0001"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono"
                    />
                    {satsNo && (
                      <div className="mt-2 text-xs text-center">
                        {(() => {
                          const result = processStudentId(satsNo);
                          return (
                            <span className={result.status === 'Valid' ? 'text-green-600' : 'text-red-600'}>
                              Format: {result.formatType} | Status: {result.status}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date *
                  </label>
                  <div className="relative">
                    <Calendar className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={searchAttendance}
                    disabled={loading}
                    className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        <span>Check Attendance</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {hasSearched && (
                <div className="mt-4 text-center">
                  <button
                    onClick={resetSearch}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Search for another student
                  </button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 mb-1">How to Use</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Enter your child's Sats No. (Student ID) as provided by the college</li>
                    <li>• Supports both numeric (e.g., 265212747) and alphanumeric (e.g., U01IQ25M0001) formats</li>
                    <li>• Select the date you want to check attendance for</li>
                    <li>• Click "Check Attendance" to view the records</li>
                    <li>• You can check attendance for any past or current date</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        {studentData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Student Name</p>
                <p className="text-lg font-semibold text-gray-900">{studentData.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Sats No.</p>
                <p className="text-lg font-semibold text-gray-900">{formatStudentIdForDisplay(studentData.rollNumber)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Class</p>
                <p className="text-lg font-semibold text-gray-900">{studentData.class}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Year</p>
                <p className="text-lg font-semibold text-gray-900">{studentData.year || 'N/A'}</p>
              </div>
            </div>

            {/* Contact Information */}
            {(studentData.parentEmail || studentData.parentPhone) && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Registered Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                  {studentData.parentEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{studentData.parentEmail}</span>
                    </div>
                  )}
                  {studentData.parentPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{studentData.parentPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attendance Statistics */}
        {studentData && attendanceData.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
                </div>
                <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.presentCount}</p>
                </div>
                <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl lg:text-3xl font-bold text-red-600">{stats.absentCount}</p>
                </div>
                <XCircle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Sports</p>
                  <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.sportsCount}</p>
                </div>
                <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">EC</p>
                  <p className="text-2xl lg:text-3xl font-bold text-purple-600">{stats.ecCount}</p>
                </div>
                <Star className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
              </div>
            </div>
            
            <div className={`rounded-xl shadow-sm border p-6 ${getAttendanceBgColor(stats.attendancePercentage)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Attendance %</p>
                  <p className={`text-2xl lg:text-3xl font-bold ${getAttendanceColor(stats.attendancePercentage)}`}>
                    {stats.attendancePercentage}%
                  </p>
                </div>
                <Calendar className={`h-6 w-6 lg:h-8 lg:w-8 ${getAttendanceColor(stats.attendancePercentage)}`} />
              </div>
            </div>
          </div>
        )}

        {/* Attendance Status Message */}
        {studentData && attendanceData.length > 0 && (
          <div className={`rounded-xl border p-6 mb-6 ${getAttendanceBgColor(stats.attendancePercentage)}`}>
            <div className="flex items-center space-x-3">
              {stats.attendancePercentage >= 85 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : stats.attendancePercentage >= 75 ? (
                <Calendar className="h-6 w-6 text-yellow-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <p className={`text-lg font-semibold ${getAttendanceColor(stats.attendancePercentage)}`}>
                  {stats.attendancePercentage >= 85 
                    ? 'Excellent Attendance!' 
                    : stats.attendancePercentage >= 75 
                    ? 'Good Attendance' 
                    : 'Attendance Needs Improvement'}
                </p>
                <p className="text-sm text-gray-600">
                  {stats.attendancePercentage >= 85 
                    ? 'Your child maintained excellent attendance on this date.' 
                    : stats.attendancePercentage >= 75
                    ? 'Your child had good attendance. Some classes were missed or excused.'
                    : 'Your child was absent for multiple classes on this date.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Records */}
        {studentData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance for {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </h3>
            </div>
            
            {attendanceData.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Classes Scheduled
                </h4>
                <p className="text-gray-600">
                  No attendance records found for {studentData.name} on {selectedDate}.
                  This could mean no classes were scheduled or attendance wasn't marked yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {attendanceData.map((record, index) => (
                  <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-full ${
                            record.status === 'present' 
                              ? 'bg-green-100' 
                              : record.status === 'absent'
                              ? 'bg-red-100'
                              : record.status === 'sports'
                              ? 'bg-blue-100'
                              : 'bg-purple-100'
                          }`}>
                            {record.status === 'present' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : record.status === 'absent' ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : record.status === 'sports' ? (
                              <Trophy className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Star className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {record.subject}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Faculty: {record.facultyName}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span><strong>Time:</strong> {record.timeSlot || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <BookOpen className="h-4 w-4" />
                            <span><strong>Class:</strong> {record.class}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : record.status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : record.status === 'sports'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {record.status === 'present' ? 'Present' : 
                               record.status === 'absent' ? 'Absent' :
                               record.status === 'sports' ? 'Sports Activity' :
                               'Extra-Curricular'}
                            </span>
                          </div>
                        </div>

                        {record.reason && (
                          <div className={`mt-3 rounded-lg p-3 ${
                            record.status === 'absent' 
                              ? 'bg-red-50 border border-red-200'
                              : record.status === 'sports'
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-purple-50 border border-purple-200'
                          }`}>
                            <p className={`text-sm font-medium mb-1 ${
                              record.status === 'absent' 
                                ? 'text-red-900'
                                : record.status === 'sports'
                                ? 'text-blue-900'
                                : 'text-purple-900'
                            }`}>
                              {record.status === 'absent' ? 'Reason for Absence:' :
                               record.status === 'sports' ? 'Sports Activity:' :
                               'Extra-Curricular Activity:'}
                            </p>
                            <p className={`text-sm ${
                              record.status === 'absent' 
                                ? 'text-red-800'
                                : record.status === 'sports'
                                ? 'text-blue-800'
                                : 'text-purple-800'
                            }`}>
                              {record.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Student Found Message */}
        {hasSearched && !studentData && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Not Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find a student with Sats No. "{formatStudentIdForDisplay(satsNo)}". Please check the number and try again.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Make sure you're entering the correct Sats No.</li>
                <li>• Supports both numeric (265212747) and alphanumeric (U01IQ25M0001) formats</li>
                <li>• Check if there are any spaces or special characters</li>
                <li>• The system will automatically standardize the format</li>
                <li>• Contact the college office if you're unsure about the Sats No.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Trinity Track - Student & Faculty Management System</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <span>Powered by</span>
            <a 
              href="https://doutly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#002e5d] hover:text-blue-800 font-semibold"
            >
              Doutly
            </a>
            <span>&</span>
            <a 
              href="https://sugarsaltmedia.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#002e5d] hover:text-blue-800 font-semibold"
            >
              Sugarsaltmedia
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}