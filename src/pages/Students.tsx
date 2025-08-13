import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Layout/Header';
import { Student, getYearsForClass, classes, subjectsByClass } from '../types';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone, GraduationCap, Building, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export function Students() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    class: '',
    year: '',
    parentEmail: '',
    parentPhone: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [currentUser]);

  const fetchStudents = async () => {
    console.log('🔄 Fetching students from Firestore...');
    try {
      // Fetch only approved students for real-time data
      const q = query(
        collection(db, 'students'), 
        where('isApproved', '==', true)
      );
      
      console.log('📡 Executing Firestore query with server source...');
      const querySnapshot = await getDocs(q, { source: 'server' });
      console.log('📊 Query completed. Documents found:', querySnapshot.size);
      
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      console.log('📋 Students data processed:', studentsData.length, 'students');
      
      // Sort by class and then by roll number
      studentsData.sort((a, b) => {
        if (a.class !== b.class) {
          return a.class.localeCompare(b.class);
        }
        return a.rollNumber.localeCompare(b.rollNumber);
      });
      
      console.log('✅ Students sorted and ready to display');
      setStudents(studentsData);
    } catch (error) {
      console.error('❌ DETAILED ERROR fetching students:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack
      });
      
      if (error.code === 'permission-denied') {
        toast.error('Cannot fetch students: Check your Firestore security rules');
      } else if (error.code === 'unavailable') {
        toast.error('Cannot fetch students: Database unavailable');
      } else {
        toast.error(`Failed to fetch students: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.rollNumber || !formData.class) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.year) {
      toast.error('Please select a year for the student');
      return;
    }

    console.log('🔄 Starting student save operation...', {
      isEditing: !!editingStudent,
      formData,
      currentUser: currentUser?.name
    });

    try {
      const studentData = {
        ...formData,
        isApproved: true, // Admin/HOD added students are auto-approved
        approvedBy: currentUser?.name,
        approvedDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        registrationDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      };

      console.log('📝 Student data to be saved:', studentData);

      if (editingStudent) {
        console.log('✏️ Updating existing student with ID:', editingStudent.id);
        await updateDoc(doc(db, 'students', editingStudent.id), formData);
        console.log('✅ Student updated successfully in Firestore');
        toast.success('Student updated successfully');
      } else {
        console.log('➕ Adding new student to Firestore...');
        const docRef = await addDoc(collection(db, 'students'), studentData);
        console.log('✅ New student added successfully with ID:', docRef.id);
        toast.success('Student added successfully');
      }
      
      console.log('🔄 Refreshing student list...');
      resetForm();
      fetchStudents();
      console.log('✅ Student operation completed successfully');
    } catch (error) {
      console.error('❌ DETAILED ERROR saving student:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
        formData,
        editingStudent: editingStudent?.id,
        currentUser: currentUser?.name
      });
      
      // More specific error messages
      if (error.code === 'permission-denied') {
        toast.error('Permission denied: Check your Firestore security rules');
      } else if (error.code === 'unavailable') {
        toast.error('Database unavailable: Check your internet connection');
      } else if (error.code === 'invalid-argument') {
        toast.error('Invalid data format: Please check all fields');
      } else {
        toast.error(`Failed to save student: ${error.message}`);
      }
    }
  };

  const handleDelete = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      class: student.class,
      year: student.year || '',
      parentEmail: student.parentEmail || '',
      parentPhone: student.parentPhone || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      class: '',
      year: '',
      parentEmail: '',
      parentPhone: ''
    });
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploadFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and format the data
        const formattedData = jsonData.map((row: any, index) => {
          const student = {
            name: row['Name'] || row['Student Name'] || '',
            email: row['Email'] || row['Email Address'] || '',
            rollNumber: row['Sats No.'] || row['Roll Number'] || row['Roll'] || '',
            class: row['Class'] || '',
            year: row['Year'] || '',
            parentEmail: row['Parent Email'] || '',
            parentPhone: row['Parent Phone'] || '',
            rowIndex: index + 2 // Excel row number (starting from 2)
          };
          
          // Validate required fields
          student.isValid = !!(student.name && student.email && student.rollNumber && student.class && student.year);
          
          return student;
        });
        
        setUploadPreview(formattedData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Error reading Excel file. Please check the format.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (!uploadPreview.length) {
      toast.error('No data to upload');
      return;
    }

    const validStudents = uploadPreview.filter(student => student.isValid);
    
    if (validStudents.length === 0) {
      toast.error('No valid student records found');
      return;
    }

    console.log('🔄 Starting bulk upload operation...', {
      totalStudents: validStudents.length,
      currentUser: currentUser?.name
    });
    setUploadLoading(true);
    
    try {
      const batch = writeBatch(db);
      
      console.log('📝 Preparing batch write for', validStudents.length, 'students');
      
      validStudents.forEach((student) => {
        const docRef = doc(collection(db, 'students'));
        const studentData = {
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          class: student.class,
          year: student.year,
          parentEmail: student.parentEmail || '',
          parentPhone: student.parentPhone || '',
          isApproved: true, // Auto-approve bulk uploads
          approvedBy: currentUser?.name,
          approvedDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          registrationDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };
        
        console.log('📄 Adding student to batch:', student.name, student.rollNumber);
        batch.set(docRef, studentData);
      });
      
      console.log('🚀 Committing batch write to Firestore...');
      await batch.commit();
      console.log('✅ Batch write completed successfully');
      
      toast.success(`Successfully uploaded ${validStudents.length} students`);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview([]);
      console.log('🔄 Refreshing student list after bulk upload...');
      fetchStudents();
      console.log('✅ Bulk upload operation completed');
      
    } catch (error) {
      console.error('❌ DETAILED ERROR during bulk upload:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
        validStudentsCount: validStudents.length,
        currentUser: currentUser?.name
      });
      
      // More specific error messages for bulk upload
      if (error.code === 'permission-denied') {
        toast.error('Bulk upload failed: Check your Firestore security rules');
      } else if (error.code === 'unavailable') {
        toast.error('Bulk upload failed: Database unavailable');
      } else {
        toast.error(`Bulk upload failed: ${error.message}`);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Name': 'John Doe',
        'Email': 'john.doe@student.edu',
        'Sats No.': 'BCA001',
        'Class': 'BCA',
        'Year': '1st Year',
        'Parent Email': 'parent@email.com',
        'Parent Phone': '+1234567890'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students Template');
    
    XLSX.writeFile(wb, 'students-template.xlsx');
  };

  const exportStudents = () => {
    const exportData = filteredStudents.map(student => ({
      'Name': student.name,
      'Email': student.email,
      'Sats No.': student.rollNumber,
      'Class': student.class,
      'Year': student.year || '',
      'Parent Email': student.parentEmail || '',
      'Parent Phone': student.parentPhone || '',
      'Registration Date': student.registrationDate || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    const fileName = `students-${selectedClass || 'all-classes'}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === '' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStudentStats = () => {
    const totalStudents = filteredStudents.length;
    const byClass = classes.reduce((acc, cls) => {
      acc[cls] = filteredStudents.filter(s => s.class === cls).length;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalStudents, byClass };
  };

  const stats = getStudentStats();

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-4 lg:p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Student Management
              </h1>
              <p className="text-sm lg:text-base text-gray-600">
                Manage all approved student records and information
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={exportStudents}
                disabled={filteredStudents.length === 0}
                className="bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm lg:text-base"
              >
                <Upload className="h-4 w-4" />
                <span>Bulk Upload</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-[#002e5d] text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm lg:text-base"
              >
                <Plus className="h-4 w-4" />
                <span>{showForm ? 'View Students' : 'Add Student'}</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes</p>
                  <p className="text-3xl font-bold text-green-600">{Object.keys(stats.byClass).filter(cls => stats.byClass[cls] > 0).length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.byClass).filter(cls => stats.byClass[cls] > 0).length}</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selected Class</p>
                  <p className="text-3xl font-bold text-orange-600">{selectedClass ? stats.byClass[selectedClass] : stats.totalStudents}</p>
                </div>
                <Filter className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {showForm ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6 transform transition-all duration-300">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sats No. *
                  </label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
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
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Year</option>
                    {getYearsForClass(formData.class).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="lg:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    type="submit"
                    className="bg-[#002e5d] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105 text-sm lg:text-base"
                  >
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900">Filter Students</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setSelectedClass('');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm lg:text-base"
                  >
                    Clear Filters
                  </button>
                </div>

                <div className="mt-4 text-xs lg:text-sm text-gray-600">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-600">No students match your search criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto table-container">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sats No.
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Program
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Contact
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 lg:px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-none">{student.name}</div>
                                <div className="text-xs lg:text-sm text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-24 lg:max-w-none">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.rollNumber}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                {student.class}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                {student.year || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                              {student.parentEmail && (
                                <div className="flex items-center mb-1">
                                  <Mail className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-24 lg:max-w-32">{student.parentEmail}</span>
                                </div>
                              )}
                              {student.parentPhone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {student.parentPhone}
                                </div>
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(student)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors transform hover:scale-110"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(student.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded transition-colors transform hover:scale-110"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bulk Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-4 lg:p-6 transform transition-all duration-300 my-8 form-container max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Bulk Upload Students</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadPreview([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
                      <ul className="text-xs lg:text-sm text-blue-800 space-y-1">
                        <li>• Upload an Excel file (.xlsx or .xls) with student data</li>
                        <li>• Required columns: Name, Email, Sats No., Class, Year</li>
                        <li>• Optional columns: Parent Email, Parent Phone</li>
                        <li>• Download the template below for the correct format</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Template Download */}
                <div className="flex justify-center">
                  <button
                    onClick={downloadTemplate}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm lg:text-base"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Template</span>
                  </button>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Excel File
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Preview */}
                {uploadPreview.length > 0 && (
                  <div>
                    <h4 className="text-sm lg:text-base font-medium text-gray-900 mb-4">Preview ({uploadPreview.length} records)</h4>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-4 text-xs lg:text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800">Valid: {uploadPreview.filter(s => s.isValid).length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-800">Invalid: {uploadPreview.filter(s => !s.isValid).length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sats No.</th>
                            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {uploadPreview.map((student, index) => (
                            <tr key={index} className={student.isValid ? 'bg-green-50' : 'bg-red-50'}>
                              <td className="px-2 lg:px-4 py-2 whitespace-nowrap">
                                {student.isValid ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </td>
                              <td className="px-2 lg:px-4 py-2 text-xs lg:text-sm truncate max-w-24 lg:max-w-none">{student.name}</td>
                              <td className="px-2 lg:px-4 py-2 text-xs lg:text-sm truncate max-w-24 lg:max-w-none hidden sm:table-cell">{student.email}</td>
                              <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm">{student.rollNumber}</td>
                              <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm">{student.class}</td>
                              <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm">{student.year || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {uploadPreview.length > 0 && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleBulkUpload}
                      disabled={uploadLoading || uploadPreview.filter(s => s.isValid).length === 0}
                      className="flex-1 bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm lg:text-base"
                    >
                      {uploadLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span>Upload {uploadPreview.filter(s => s.isValid).length} Students</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreview([]);
                      }}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}