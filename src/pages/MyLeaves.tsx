import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Layout/Header';
import { LeaveApplicationForm } from '../components/Leave/LeaveApplicationForm';
import { LeaveApplication } from '../types';
import { Calendar, Clock, CheckCircle, XCircle, FileText, Plus, User, MessageSquare } from 'lucide-react';

export function MyLeaves() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMyLeaves();
  }, [currentUser]);

  const fetchMyLeaves = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'leaveApplications'),
        where('facultyId', '==', currentUser.id)
      );
      const querySnapshot = await getDocs(q);
      const leavesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveApplication[];
      
      // Sort by appliedDate in descending order (client-side)
      const sortedLeaves = leavesData.sort((a, b) => {
        const dateA = new Date(a.appliedDate);
        const dateB = new Date(b.appliedDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      setLeaves(sortedLeaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_committee_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_principal_approval':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending_committee_approval':
        return <Clock className="h-4 w-4" />;
      case 'pending_principal_approval':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getLeaveStats = () => {
    const total = leaves.length;
    const pending = leaves.filter(l => 
      l.status === 'pending_committee_approval' || l.status === 'pending_principal_approval'
    ).length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getLeaveStats();

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Leave Applications</h1>
              <p className="text-gray-600">
                Manage your leave requests and view application history.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#002e5d] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{showForm ? 'View Applications' : 'Apply for Leave'}</span>
            </button>
          </div>

          {/* Stats Cards */}
          {!showForm && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>
          )}

          {showForm ? (
            <LeaveApplicationForm />
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
                </div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications</h3>
                  <p className="text-gray-600">You haven't submitted any leave applications yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{leave.subject}</h3>
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(leave.status)}`}>
                              {getStatusIcon(leave.status)}
                              <span className="capitalize">{leave.status}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span><strong>Duration:</strong> {leave.startDate} to {leave.endDate}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span><strong>Type:</strong> {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span><strong>Applied:</strong> {leave.appliedDate}</span>
                            </div>
                          </div>

                          {leave.description && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 mb-1">Description:</p>
                              <p className="text-gray-700">{leave.description}</p>
                            </div>
                          )}

                          {leave.comments && (
                            <div className={`rounded-lg p-3 border ${
                              leave.status === 'approved' ? 'bg-green-50 border-green-200' :
                              leave.status === 'rejected' ? 'bg-red-50 border-red-200' :
                              'bg-blue-50 border-blue-200'
                            }`}>
                              <div className="flex items-center space-x-2 mb-1">
                                <MessageSquare className="h-4 w-4" />
                                <p className="text-sm font-medium text-gray-900">Review Comments:</p>
                              </div>
                              <p className="text-sm text-gray-700">{leave.comments}</p>
                              {leave.reviewedBy && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Reviewed by {leave.reviewedBy} on {leave.reviewedDate}
                                </p>
                              )}
                            </div>
                          )}

                          {leave.committeeComments && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center space-x-2 mb-1">
                                <MessageSquare className="h-4 w-4" />
                                <p className="text-sm font-medium text-purple-900">Committee Comments:</p>
                              </div>
                              <p className="text-sm text-purple-800">{leave.committeeComments}</p>
                              {leave.committeeReviewedBy && (
                                <p className="text-xs text-purple-600 mt-2">
                                  Reviewed by {leave.committeeReviewedBy} on {leave.committeeReviewedDate}
                                </p>
                              )}
                            </div>
                          )}

                          {leave.principalComments && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center space-x-2 mb-1">
                                <MessageSquare className="h-4 w-4" />
                                <p className="text-sm font-medium text-green-900">Principal Comments:</p>
                              </div>
                              <p className="text-sm text-green-800">{leave.principalComments}</p>
                              {leave.principalReviewedBy && (
                                <p className="text-xs text-green-600 mt-2">
                                  Reviewed by {leave.principalReviewedBy} on {leave.principalReviewedDate}
                                </p>
                              )}
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
        </div>
      </main>
    </div>
  );
}