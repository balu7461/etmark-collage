import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TimetableForm } from '../components/Timetable/TimetableForm';
import { TimetableGrid } from '../components/Timetable/TimetableGrid';
import { TimeSlot, getYearsForClass, classes, subjectsByClass } from '../types';
import { CalendarDays, Plus, Filter, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export function Timetable() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const semesters = ['1', '2', '3', '4', '5', '6'];



  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'timeSlots'));
      const timeSlotsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeSlot[];
      
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (timeSlotId: string) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await deleteDoc(doc(db, 'timeSlots', timeSlotId));
        toast.success('Time slot deleted successfully');
        fetchTimeSlots();
      } catch (error) {
        console.error('Error deleting time slot:', error);
        toast.error('Failed to delete time slot');
      }
    }
  };

  const exportTimetable = () => {
    const filteredSlots = getFilteredTimeSlots();
    
    const exportData = filteredSlots.map(slot => ({
      'Day': slot.day,
      'Time': `${slot.startTime} - ${slot.endTime}`,
      'Subject': slot.subject,
      'Faculty': slot.facultyName,
      'Class': slot.class,
      'Room': slot.room || '',
      'Semester': slot.semester,
      'Academic Year': slot.academicYear
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    
    const fileName = `timetable-${selectedClass || 'all-classes'}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getFilteredTimeSlots = () => {
    return timeSlots.filter(slot => {
      const matchesClass = !selectedClass || slot.class === selectedClass;
      const matchesYear = !selectedYear || slot.year === selectedYear;
      const matchesSemester = !selectedSemester || slot.semester === selectedSemester;
      const matchesSearch = !searchTerm || 
        slot.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.facultyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesClass && matchesYear && matchesSemester && matchesSearch;
    });
  };

  const filteredTimeSlots = getFilteredTimeSlots();

  const getTimetableStats = () => {
    const totalSlots = filteredTimeSlots.length;
    const uniqueSubjects = new Set(filteredTimeSlots.map(slot => slot.subject)).size;
    const uniqueFaculty = new Set(filteredTimeSlots.map(slot => slot.facultyId)).size;
    const uniqueClasses = new Set(filteredTimeSlots.map(slot => slot.class)).size;
    
    return { totalSlots, uniqueSubjects, uniqueFaculty, uniqueClasses };
  };

  const stats = getTimetableStats();

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Timetable Management</h1>
              <p className="text-gray-600">Manage class schedules and time slots</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportTimetable}
                disabled={filteredTimeSlots.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-[#002e5d] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{showForm ? 'View Timetable' : 'Add Time Slot'}</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Time Slots</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalSlots}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subjects</p>
                  <p className="text-3xl font-bold text-green-600">{stats.uniqueSubjects}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">S</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faculty</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.uniqueFaculty}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">F</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.uniqueClasses}</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">C</span>
                </div>
              </div>
            </div>
          </div>

          {showForm ? (
            <TimetableForm onSuccess={() => {
              fetchTimeSlots();
              setShowForm(false);
            }} />
          ) : (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search subject or faculty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {(selectedClass ? getYearsForClass(selectedClass) : ['1st Year', '2nd Year', '3rd Year']).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setSelectedClass('');
                      setSelectedYear('');
                      setSelectedSemester('');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Timetable Grid */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
                </div>
              ) : (
                <TimetableGrid
                  timeSlots={filteredTimeSlots}
                  selectedClass={selectedClass}
                  selectedYear={selectedYear}
                  isAdmin={true}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}