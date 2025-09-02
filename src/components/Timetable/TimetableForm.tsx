import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { TimeSlot, User } from '../../types';
import { CalendarDays, Plus, Save, Clock, MapPin, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TimetableFormProps {
  onSuccess?: () => void;
}

export function TimetableForm({ onSuccess }: TimetableFormProps) {
  const { currentUser } = useAuth();
  const [faculty, setFaculty] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    day: '' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | '',
    startTime: '',
    endTime: '',
    subject: '',
    facultyId: '',
    class: '',
    year: '',
    room: '',
    semester: '',
    academicYear: new Date().getFullYear().toString()
  });
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const classes = ['B.com', 'BBA', 'BCA', 'PCMB', 'PCMC', 'EBAC', 'EBAS'];
  const semesters = ['1', '2', '3', '4', '5', '6'];
  
  const getYearsForClass = (selectedClass: string) => {
    if (['B.com', 'BBA', 'BCA'].includes(selectedClass)) {
      return ['1st Year', '2nd Year', '3rd Year'];
    } else if (['PCMB', 'PCMC', 'EBAC', 'EBAS'].includes(selectedClass)) {
      return ['1st Year', '2nd Year'];
    }
    return [];
  };
  
  const subjectsByClassAndYear = {
    'B.com': {
      '1st Year': ['Fundamentals of Financial Accounting', 'Business Communication', 'Business Mathematics', 'Banking Law and Practice', 'Kannada/Hindi', 'Constitutional Values with Reference to India', 'English'],
      '2nd Year': ['Fundamentals of Corporate Accounting', 'Logistics and Supply Chain Management', 'Advanced Cost Accounting', 'Income Tax Law & Practice', 'English', 'Financial Institutions and Markets', 'Kannada/Hindi'],
      '3rd Year': ['Financial Management', 'Financial Institutions and Markets', 'Employability Skills', 'Income Tax Law and Practice – I', 'Principles and Practice of Auditing']
    },
    'BBA': {
      '1st Year': ['Fundamentals of Business Accounting', 'Business Economics', 'Principles and Practices of Management', 'Kannada/Hindi/French', 'Constitutional Values with Reference to India', 'English'],
      '2nd Year': ['Cost Accounting', 'Entrepreneurship and Startup Ecosystem', 'Business Environment', 'Business Statistics II', 'English', 'Financial Institutions and Markets', 'Kannada/Hindi'],
      '3rd Year': ['Retail Management', 'Advanced Corporate Financial Management', 'Digital Marketing', 'Income Tax – I', 'Banking Law and Practice', 'Employability Skills']
    },
    'BCA': {
      '1st Year': ['Digital Computer Organization', 'Mathematical and Statistical Computing', 'Problem Solving Using C++', 'Kannada/Hindi', 'Environmental Studies', 'English'],
      '2nd Year': ['C#.Net Programming', 'Cloud Computing', 'Web Technologies', 'Data Base Management System', 'Cyber Security', 'Kannada/Hindi', 'English'],
      '3rd Year': ['Design and Analysis of Algorithms', 'Software Engineering', 'Statistical Computing and R Programming', 'Cloud Computing', 'Employability Skills', 'Digital Marketing']
    },
    'PCMB': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    'PCMC': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    'EBAC': ['Economics', 'Business Studies', 'Accountancy', 'Computer Science'],
    'EBAS': ['Economics', 'Business Studies', 'Accountancy', 'Statistics']
  };

  const timeSlots = [
    { start: '09:30', end: '10:25', label: '09:30 - 10:25' },
    { start: '10:25', end: '11:20', label: '10:25 - 11:20' },
    { start: '11:35', end: '12:30', label: '11:35 - 12:30' },
    { start: '12:30', end: '13:15', label: '12:30 - 1:15' },
    { start: '13:15', end: '14:10', label: '1:15 - 2:10' },
    { start: '14:10', end: '15:05', label: '2:10 - 3:05' },
    { start: '15:05', end: '16:00', label: '3:05 - 4:00' }
  ];

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'faculty'));
      const querySnapshot = await getDocs(q);
      const facultyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to fetch faculty list');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.day || !formData.startTime || !formData.endTime || !formData.subject || !formData.facultyId || !formData.class || !formData.year || !formData.semester) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const selectedFaculty = faculty.find(f => f.id === formData.facultyId);
      
      const timeSlot: Omit<TimeSlot, 'id'> = {
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subject: formData.subject,
        facultyId: formData.facultyId,
        facultyName: selectedFaculty?.name || '',
        class: formData.class,
        year: formData.year,
        room: formData.room,
        semester: formData.semester,
        academicYear: formData.academicYear
      };

      await addDoc(collection(db, 'timeSlots'), timeSlot);
      
      toast.success('Time slot added successfully!');
      
      // Reset form
      setFormData({
        day: '',
        startTime: '',
        endTime: '',
        subject: '',
        facultyId: '',
        class: '',
        year: '',
        room: '',
        semester: '',
        academicYear: new Date().getFullYear().toString()
      });

      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast.error('Failed to add time slot');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <CalendarDays className="h-6 w-6 text-[#002e5d]" />
        <h2 className="text-xl font-semibold text-gray-900">Add Time Slot</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day *
            </label>
            <select
              value={formData.day}
              onChange={handleChange('day')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Day</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <select
              value={formData.startTime}
              onChange={handleChange('startTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Start Time</option>
              {timeSlots.map(slot => (
                <option key={slot.start} value={slot.start}>{slot.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <select
              value={formData.endTime}
              onChange={handleChange('endTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select End Time</option>
              {timeSlots.map(slot => (
                <option key={slot.end} value={slot.end}>{slot.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            {formData.class ? (
              <select
                value={formData.subject}
                onChange={handleChange('subject')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Subject</option>
                {formData.year && subjectsByClassAndYear[formData.class as keyof typeof subjectsByClassAndYear] ? (
                  (subjectsByClassAndYear[formData.class as keyof typeof subjectsByClassAndYear] as any)[formData.year]?.map((subj: string) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))
                ) : (
                  <option value="" disabled>Select Year First</option>
                )}
              </select>
            ) : (
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              >
                <option value="">Select Class and Year First</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faculty *
            </label>
            <select
              value={formData.facultyId}
              onChange={handleChange('facultyId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Faculty</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class *
            </label>
            <select
              value={formData.class}
              onChange={handleChange('class')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <select
              value={formData.year}
              onChange={handleChange('year')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Year</option>
              {getYearsForClass(formData.class).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester *
            </label>
            <select
              value={formData.semester}
              onChange={handleChange('semester')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={handleChange('room')}
              placeholder="Room number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year *
            </label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={handleChange('academicYear')}
              placeholder="2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Add Time Slot</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}