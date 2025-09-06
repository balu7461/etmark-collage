import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AttendanceRecord, Student } from '../types';
import { Calendar, Users, Filter, Download, Search, Trophy, Star } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ALL_CLASSES, getYearsForClass, subjectsByClassAndYear, hasSubjectDefinitions } from '../utils/constants';

export function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    class: '',
    year: '',
    subject: '',
    faculty: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch attendance records
      const attendanceQuery = query(
        collection(db, 'attendance'),
        orderBy('date', 'desc')
      );
      const attendanceSnapshot = await getDocs(attendanceQuery, { source: 'server' });
      const attendanceData = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

      // Fetch students
      const studentsQuery = query(
        collection(db, 'students'),
        where('isApproved', '==', true)
      );
      const studentsSnapshot = await getDocs(studentsQuery, { source: 'server' });
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];

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

      setAttendanceRecords(attendanceData);
      setStudents(validStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStudentRollNumber = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.rollNumber : 'N/A';
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesDateRange = record.date >= filters.startDate && record.date <= filters.endDate;
    const matchesClass = !filters.class || record.class === filters.class;
    const matchesYear = !filters.year || record.year === filters.year;
    const matchesSubject = !filters.subject || record.subject.toLowerCase().includes(filters.subject.toLowerCase());
    const matchesFaculty = !filters.faculty || record.facultyName.toLowerCase().includes(filters.faculty.toLowerCase());
    
    return matchesDateRange && matchesClass && matchesYear && matchesSubject && matchesFaculty;
  });

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => ({
      'Date': record.date,
      'Student Name': getStudentName(record.studentId),
      'Sats No.': getStudentRollNumber(record.studentId),
      'Class': record.class,
      'Subject': record.subject,
      'Status': record.status,
      'Reason': record.reason || '',
      'Faculty': record.facultyName
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    
    const fileName = `attendance-report-${filters.startDate}-to-${filters.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getAttendanceStats = () => {
    const totalRecords = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'present').length;
    const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
    const sportsCount = filteredRecords.filter(r => r.status === 'sports').length;
    const ecCount = filteredRecords.filter(r => r.status === 'ec').length;
    // Sports and EC count as excused attendance (positive towards percentage)
    const excusedCount = presentCount + sportsCount + ecCount;
    const attendanceRate = totalRecords > 0 ? ((excusedCount / totalRecords) * 100).toFixed(1) : '0';

    return { totalRecords, presentCount, absentCount, sportsCount, ecCount, attendanceRate };
  };

  const stats = getAttendanceStats();

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
              <p className="text-gray-600">View and manage student attendance records</p>
            </div>
            <button
              onClick={exportToExcel}
              disabled={filteredRecords.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.presentCount}</p>
                </div>
                <div className="h-6 w-6 lg:h-8 lg:w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl lg:text-3xl font-bold text-red-600">{stats.absentCount}</p>
                </div>
                <div className="h-6 w-6 lg:h-8 lg:w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">✗</span>
                </div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl lg:text-3xl font-bold text-[#002e5d]">{stats.attendanceRate}%</p>
                </div>
                <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-[#002e5d]" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={filters.class}
                  onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Classes</option>
                  {ALL_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {(filters.class ? getYearsForClass(filters.class) : ['1st Year', '2nd Year', '3rd Year']).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  {filters.class && filters.year && subjectsByClassAndYear[filters.class as keyof typeof subjectsByClassAndYear] ? (
                    (subjectsByClassAndYear[filters.class as keyof typeof subjectsByClassAndYear] as any)[filters.year]?.map((subj: string) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))
                  ) : filters.class && subjectsByClassAndYear[filters.class as keyof typeof subjectsByClassAndYear] ? (
                    Object.values((subjectsByClassAndYear[filters.class as keyof typeof subjectsByClassAndYear] as any) || {}).flat().map((subj: string) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))
                  ) : (
                    // Show all subjects from classes with definitions
                    Object.values(subjectsByClassAndYear).flatMap(classData => 
                      Object.values(classData).flat()
                    ).map((subj: string) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={filters.faculty}
                  onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Class Distribution Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Class-wise Attendance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {ALL_CLASSES.map(cls => {
                const classRecords = filteredRecords.filter(record => record.class === cls);
                const classPresent = classRecords.filter(record => record.status === 'present').length;
                const classTotal = classRecords.length;
                const classRate = classTotal > 0 ? Math.round((classPresent / classTotal) * 100) : 0;
                
                return (
                  <div key={cls} className="text-center p-3 bg-gray-50 rounded-lg transform transition-all duration-200 hover:scale-105">
                    <p className="text-sm font-medium text-gray-900">{cls}</p>
                    <p className="text-lg font-bold text-blue-600">{classTotal}</p>
                    <p className="text-xs text-gray-600">{classTotal > 0 ? `${classRate}%` : 'No data'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{getStudentName(record.studentId)}</div>
                            <div className="text-sm text-gray-500">{getStudentRollNumber(record.studentId)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {record.class}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                            {record.year || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                            {record.timeSlot || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                             record.status === 'sports' ? 'Sports' :
                             'EC'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.facultyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}