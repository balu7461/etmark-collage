import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Student, StudentAchievement } from '../../types';
import { Award, Plus, User, Calendar, MapPin, Trophy, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ALL_CLASSES, getYearsForClass } from '../../utils/constants';
import { processStudentData } from '../../utils/dataNormalization';

export function StudentAchievementForm() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    category: '' as 'Sports' | 'Cultural' | 'Academic' | 'Other' | '',
    title: '',
    description: '',
    date: '',
    location: '',
    outcome: '',
    highlightPhotosLink: '',
    branch: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'Sports', label: 'Sports' },
    { value: 'Cultural', label: 'Cultural' },
    { value: 'Academic', label: 'Academic' },
    { value: 'Other', label: 'Other' }
  ];

  const outcomes = [
    'Participation Certificate',
    'Merit Certificate',
    '1st Place',
    '2nd Place', 
    '3rd Place',
    'Winner',
    'Runner-up',
    'Best Performance',
    'Special Recognition',
    'Other'
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Fetch all students for achievement assignment
      const q = query(
        collection(db, 'students')
      );
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        rollNumber: String(doc.data().rollNumber || '')
      })) as Student[];
      
      // Process and normalize student data to handle class/year inconsistencies
      const validStudents = processStudentData(studentsData);
      
      setStudents(validStudents.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleStudentChange = (studentId: string) => {
    const selectedStudent = students.find(s => s.id === studentId);
    if (selectedStudent) {
      const nameParts = selectedStudent.name.split(' ');
      setFormData(prev => ({
        ...prev,
        studentId,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        branch: selectedStudent.class
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.studentId || !formData.firstName || !formData.category || !formData.title || !formData.date || !formData.branch) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const selectedStudent = students.find(s => s.id === formData.studentId);
      
      const studentAchievement: Omit<StudentAchievement, 'id'> = {
        studentId: formData.studentId,
        studentName: selectedStudent?.name || `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        outcome: formData.outcome,
        highlightPhotosLink: formData.highlightPhotosLink,
        branch: formData.branch,
        submittedDate: format(new Date(), 'yyyy-MM-dd')
      };

      await addDoc(collection(db, 'studentAchievements'), studentAchievement);
      
      toast.success('Student achievement added successfully!');
      
      // Reset form
      setFormData({
        studentId: '',
        firstName: '',
        lastName: '',
        category: '',
        title: '',
        description: '',
        date: '',
        location: '',
        outcome: '',
        highlightPhotosLink: '',
        branch: ''
      });
      
    } catch (error) {
      console.error('Error adding student achievement:', error);
      toast.error('Failed to add student achievement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (field === 'studentId') {
      handleStudentChange(e.target.value);
    } else {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Award className="h-6 w-6 text-[#002e5d]" />
        <h2 className="text-xl font-semibold text-gray-900">Add Student Achievement</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-[#002e5d]" />
                <span>Select Student *</span>
              </div>
            </label>
            <select
              value={formData.studentId}
              onChange={handleChange('studentId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} (Sats No: {student.rollNumber}) - {student.class}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={handleChange('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              placeholder="Enter first name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              placeholder="Enter last name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Achievement Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="Enter achievement title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Describe the achievement"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-[#002e5d]" />
                <span>Date *</span>
              </div>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={handleChange('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#002e5d]" />
                <span>Location</span>
              </div>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={handleChange('location')}
              placeholder="Event location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-[#002e5d]" />
                <span>Branch/Class *</span>
              </div>
            </label>
            <select
              value={formData.branch}
              onChange={handleChange('branch')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Branch/Class</option>
              {ALL_CLASSES.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-[#002e5d]" />
              <span>Outcome</span>
            </div>
          </label>
          <select
            value={formData.outcome}
            onChange={handleChange('outcome')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Outcome</option>
            {outcomes.map(outcome => (
              <option key={outcome} value={outcome}>{outcome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-red-600" />
              <span className="text-red-600">Highlight Photos Link (Google Drive)</span>
            </div>
          </label>
          <input
            type="url"
            value={formData.highlightPhotosLink}
            onChange={handleChange('highlightPhotosLink')}
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-red-700 placeholder-red-400"
          />
          <p className="text-xs text-red-500 mt-1">
            Upload photos to Google Drive and paste the shareable link here
          </p>
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
              <Plus className="h-5 w-5" />
              <span>Add Student Achievement</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}