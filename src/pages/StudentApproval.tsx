import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Layout/Header';
import { Student } from '../types';
import { GraduationCap, UserX, Clock, CheckCircle, XCircle, Mail, Phone, Building, Calendar, Users, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function StudentApproval() {
  const { currentUser } = useAuth();
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Fetch pending students
      const pendingQuery = query(
        collection(db, 'students'),
        where('isApproved', '==', false)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingData = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];

      // Fetch approved students
      const approvedQuery = query(
        collection(db, 'students'),
        where('isApproved', '==', true)
      );
      const approvedSnapshot = await getDocs(approvedQuery);
      const approvedData = approvedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];

      setPendingStudents(pendingData);
      setApprovedStudents(approvedData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId: string, studentName: string) => {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        isApproved: true,
        approvedBy: currentUser?.name,
        approvedDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      });

      toast.success(`Student ${studentName} has been approved successfully!`);
      fetchStudents();
    } catch (error) {
      console.error('Error approving student:', error);
      toast.error('Failed to approve student');
    }
  };

  const handleReject = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to reject student ${studentName}'s application? This will permanently delete their record.`)) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
        toast.success(`Student ${studentName}'s application has been rejected and record deleted.`);
        fetchStudents();
      } catch (error) {
        console.error('Error rejecting student:', error);
        toast.error('Failed to reject student application');
      }
    }
  };

  const handleRevoke = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to revoke approval for student ${studentName}? They will be moved back to pending status.`)) {
      try {
        await updateDoc(doc(db, 'students', studentId), {
          isApproved: false,
          approvedBy: null,
          approvedDate: null
        });

        toast.success(`Approval revoked for student ${studentName}`);
        fetchStudents();
      } catch (error) {
        console.error('Error revoking approval:', error);
        toast.error('Failed to revoke approval');
      }
    }
  };

  const stats = {
    pending: pendingStudents.length,
    approved: approvedStudents.length,
    total: pendingStudents.length + approvedStudents.length,
  };

  const displayedStudents = filter === 'pending' ? pendingStudents : approvedStudents;

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Approval Management</h1>
            <p className="text-gray-600">Review and approve student registration requests</p>
            
            {/* Admin Notice */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Student Approval System</p>
                  <p className="text-blue-700">
                    All new student registrations require your approval before they can access the system. 
                    Review student information carefully before approving.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Students</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              {stats.pending > 0 && (
                <div className="mt-2 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">Requires attention</span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Students</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes</p>
                  <p className="text-3xl font-bold text-purple-600">7</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  filter === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Pending Approval ({stats.pending})</span>
                  {stats.pending > 0 && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  filter === 'approved'
                    ? 'bg-green-100 text-green-800 border border-green-300 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Approved ({stats.approved})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
              </div>
            ) : displayedStudents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                {filter === 'pending' ? (
                  <>
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending student approvals</h3>
                    <p className="text-gray-600">All student registrations have been processed.</p>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No approved students</h3>
                    <p className="text-gray-600">No students have been approved yet.</p>
                  </>
                )}
              </div>
            ) : (
              displayedStudents.map((student) => (
                <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${
                          student.isApproved 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {student.isApproved ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Approved</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4" />
                              <span>Pending</span>
                            </>
                          )}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4" />
                          <span>Roll: {student.rollNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Class: {student.class}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Registered: {student.registrationDate}</span>
                        </div>
                      </div>

                      {(student.parentEmail || student.parentPhone) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">Parent/Guardian Information:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            {student.parentEmail && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-3 w-3" />
                                <span>{student.parentEmail}</span>
                              </div>
                            )}
                            {student.parentPhone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3" />
                                <span>{student.parentPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {student.isApproved && student.approvedBy && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            <strong>Approved by:</strong> {student.approvedBy} on {student.approvedDate}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex space-x-2">
                      {!student.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(student.id, student.name)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve Student</span>
                          </button>
                          <button
                            onClick={() => handleReject(student.id, student.name)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRevoke(student.id, student.name)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}