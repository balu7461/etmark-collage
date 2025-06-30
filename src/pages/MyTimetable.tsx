import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Layout/Header';
import { TimetableGrid } from '../components/Timetable/TimetableGrid';
import { TimeSlot } from '../types';
import { CalendarDays, Clock, BookOpen, MapPin, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export function MyTimetable() {
  const { currentUser } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('current');

  useEffect(() => {
    if (currentUser) {
      fetchMyTimeSlots();
    }
  }, [currentUser]);

  const fetchMyTimeSlots = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'timeSlots'),
        where('facultyId', '==', currentUser.id)
      );
      const querySnapshot = await getDocs(q);
      const timeSlotsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeSlot[];
      
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Error fetching my time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMyTimetable = () => {
    const exportData = timeSlots.map(slot => ({
      'Day': slot.day,
      'Time': `${slot.startTime} - ${slot.endTime}`,
      'Subject': slot.subject,
      'Class': slot.class,
      'Room': slot.room || '',
      'Semester': slot.semester,
      'Academic Year': slot.academicYear
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'My Timetable');
    
    const fileName = `my-timetable-${currentUser?.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getTimetableStats = () => {
    const totalClasses = timeSlots.length;
    const uniqueSubjects = new Set(timeSlots.map(slot => slot.subject)).size;
    const uniqueClasses = new Set(timeSlots.map(slot => slot.class)).size;
    
    // Calculate classes per day
    const classesPerDay = timeSlots.reduce((acc, slot) => {
      acc[slot.day] = (acc[slot.day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgClassesPerDay = Object.keys(classesPerDay).length > 0 
      ? Math.round(totalClasses / Object.keys(classesPerDay).length * 10) / 10 
      : 0;
    
    return { totalClasses, uniqueSubjects, uniqueClasses, avgClassesPerDay };
  };

  const stats = getTimetableStats();

  const getUpcomingClasses = () => {
    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = today.toTimeString().slice(0, 5);
    
    return timeSlots
      .filter(slot => {
        if (slot.day === currentDay) {
          return slot.startTime > currentTime;
        }
        return false;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 3);
  };

  const upcomingClasses = getUpcomingClasses();

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Timetable</h1>
              <p className="text-gray-600">View your class schedule and upcoming classes</p>
            </div>
            <button
              onClick={exportMyTimetable}
              disabled={timeSlots.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Export My Timetable</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalClasses}</p>
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
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.uniqueClasses}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">C</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg/Day</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.avgClassesPerDay}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Upcoming Classes */}
          {upcomingClasses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Classes Today</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingClasses.map((slot, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{slot.subject}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{slot.class}</span>
                      </div>
                      {slot.room && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{slot.room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timetable Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes scheduled</h3>
              <p className="text-gray-600">You don't have any classes assigned yet.</p>
            </div>
          ) : (
            <TimetableGrid
              timeSlots={timeSlots}
              isAdmin={false}
            />
          )}
        </div>
      </main>
    </div>
  );
}