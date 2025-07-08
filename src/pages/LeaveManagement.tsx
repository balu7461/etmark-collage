import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Layout/Header';
import { LeaveApplication } from '../types';
import { FileText, Clock, CheckCircle, XCircle, Filter, MessageSquare, Calendar, User, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function LeaveManagement() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const departments = ['BBA', 'BCA', 'BCOM', 'MCOM'];

  useEffect(() => {
    fetchLeaves();
  }, [currentUser]);

  const fetchLeaves = async () => {
    try {
      let q;
      
      if (currentUser?.role === 'committee_member') {
        // Committee members see leaves pending their approval
        q = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_committee_approval')
        );
      } else if (currentUser?.role === 'admin') {
        // Admin (Principal) sees leaves pending final approval
        q = query(
          collection(db, 'leaveApplications'),
          where('status', '==', 'pending_principal_approval')
        );
      } else {
        // Fallback to see all leaves
        q = query(collection(db, 'leaveApplications'));
      }
      
      const querySnapshot = await getDocs(q);
      const leavesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveApplication[];
      
      // Sort by appliedDate in descending order (newest first)
      leavesData.sort((a, b) => {
        const dateA = new Date(a.appliedDate);
        const dateB = new Date(b.appliedDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      setLeaves(leavesData);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId: string, action: 'approved' | 'rejected') => {
    try {
      const updateData: any = {
        reviewedBy: currentUser?.name,
        reviewedDate: format(new Date(), 'yyyy-MM-dd'),
        comments: reviewComments
      };

      if (currentUser?.role === 'committee_member') {
        if (action === 'approved') {
          updateData.status = 'pending_principal_approval';
          updateData.committeeApproved = true;
          updateData.committeeReviewedBy = currentUser.name;
          updateData.committeeReviewedDate = format(new Date(), 'yyyy-MM-dd');
          updateData.committeeComments = reviewComments;
        } else {
          updateData.status = 'rejected';
          updateData.committeeApproved = false;
          updateData.committeeReviewedBy = currentUser.name;
          updateData.committeeReviewedDate = format(new Date(), 'yyyy-MM-dd');
          updateData.committeeComments = reviewComments;
        }
      } else if (currentUser?.role === 'admin') {
        if (action === 'approved') {
          updateData.status = 'approved';
          updateData.principalApproved = true;
          updateData.principalReviewedBy = currentUser.name;
          updateData.principalReviewedDate = format(new Date(), 'yyyy-MM-dd');
          updateData.principalComments = reviewComments;
        } else {
          updateData.status = 'rejected';
          updateData.principalApproved = false;
          updateData.principalReviewedBy = currentUser.name;
          updateData.principalReviewedDate = format(new Date(), 'yyyy-MM-dd');
          updateData.principalComments = reviewComments;
        }
      }

      await updateDoc(doc(db, 'leaveApplications', leaveId), updateData);

      toast.success(`Leave application ${action} successfully`);
      setSelectedLeave(null);
      setReviewComments('');
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave:', error);
      toast.error('Failed to update leave application');
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesStatus = filter === 'all' || leave.status === filter;
    const matchesDepartment = !departmentFilter || leave.department === departmentFilter;
    return matchesStatus && matchesDepartment;
  });

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
    const total = filteredLeaves.length;
    const pending = filteredLeaves.filter(l => 
      l.status === 'pending_committee_approval' || l.status === 'pending_principal_approval'
    ).length;
    const approved = filteredLeaves.filter(l => l.status === 'approved').length;
    const rejected = filteredLeaves.filter(l => l.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getLeaveStats();

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Leave Management {currentUser?.role === 'committee_member' && '- Committee Review'}
              {currentUser?.role === 'admin' && '- Principal Approval'}
            </h1>
            <p className="text-gray-600">
              {currentUser?.role === 'committee_member' 
                ? 'Review leave applications for committee approval'
                : currentUser?.role === 'admin'
                ? 'Final approval of leave applications as Principal'
                : 'Review and manage all faculty leave applications'
              }
            </p>
          </div>

          {/* Enhanced Stats Cards */}
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
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
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

          {/* Enhanced Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Filter Applications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-3">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                        filter === status
                          ? 'bg-[#002e5d] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {status !== 'all' && (
                        <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">
                          {status === 'pending' ? stats.pending : 
                           status === 'approved' ? stats.approved : stats.rejected}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Leave Applications */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications</h3>
                <p className="text-gray-600">No applications found for the selected filters.</p>
              </div>
            ) : (
              filteredLeaves.map((leave) => (
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span><strong>Faculty:</strong> {leave.facultyName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building className="h-4 w-4" />
                          <span><strong>Dept:</strong> {leave.department}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span><strong>Type:</strong> {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span><strong>Duration:</strong> {leave.startDate} to {leave.endDate}</span>
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-blue-900 mb-1">Review Comments:</p>
                          <p className="text-sm text-blue-800">{leave.comments}</p>
                          {leave.reviewedBy && (
                            <p className="text-xs text-blue-600 mt-2">
                              Reviewed by {leave.reviewedBy} on {leave.reviewedDate}
                            </p>
                          )}

                          {leave.committeeComments && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                              <p className="text-sm font-medium text-purple-900 mb-1">Committee Comments:</p>
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
                              <p className="text-sm font-medium text-green-900 mb-1">Principal Comments:</p>
                              <p className="text-sm text-green-800">{leave.principalComments}</p>
                              {leave.principalReviewedBy && (
                                <p className="text-xs text-green-600 mt-2">
                                  Reviewed by {leave.principalReviewedBy} on {leave.principalReviewedDate}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {(leave.status === 'pending_committee_approval' || leave.status === 'pending_principal_approval') && (
                        <div className="ml-6 flex space-x-2">
                          <button
                            onClick={() => setSelectedLeave(leave)}
                            className="bg-[#002e5d] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>Review</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Review Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 transform transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Leave Application</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div><strong>Faculty:</strong> {selectedLeave.facultyName}</div>
                  <div><strong>Department:</strong> {selectedLeave.department}</div>
                  <div><strong>Subject:</strong> {selectedLeave.subject}</div>
                  <div><strong>Type:</strong> {selectedLeave.leaveType.charAt(0).toUpperCase() + selectedLeave.leaveType.slice(1)}</div>
                  <div><strong>Duration:</strong> {selectedLeave.startDate} to {selectedLeave.endDate}</div>
                  {selectedLeave.description && (
                    <div><strong>Description:</strong> {selectedLeave.description}</div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Comments (Optional)
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add your review comments..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleLeaveAction(selectedLeave.id, 'approved')}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleLeaveAction(selectedLeave.id, 'rejected')}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedLeave(null);
                    setReviewComments('');
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}