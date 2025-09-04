import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { LeaveApplicationForm } from '../components/Leave/LeaveApplicationForm';
import { LeaveApplication } from '../types';
import { Calendar, Clock, CheckCircle, XCircle, FileText, Plus, User, MessageSquare, AlertTriangle } from 'lucide-react';
import { calculateLeaveStats, getLeaveStatusColor, getLOPStatusColor } from '../utils/leaveCalculations';

export function MyLeaves() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [leaveStats, setLeaveStats] = useState({
    totalLeavesUsed: 0,
    remainingLeaves: 12,
    totalLOP: 0,
    monthlyBreakdown: []
  });

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

      // Calculate leave statistics for approved leaves only
      const approvedLeaves = leavesData.filter(leave => leave.status === 'approved');
      const stats = calculateLeaveStats(approvedLeaves);
      setLeaveStats(stats);
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
      case 'rejected_by_examination_committee':
      case 'rejected_by_timetable_committee':
      case 'rejected_by_principal':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_examination_committee_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_timetable_committee_approval':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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
      case 'rejected_by_examination_committee':
      case 'rejected_by_timetable_committee':
      case 'rejected_by_principal':
        return <XCircle className="h-4 w-4" />;
      case 'pending_examination_committee_approval':
      case 'pending_timetable_committee_approval':
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
      l.status === 'pending_examination_committee_approval' || 
      l.status === 'pending_timetable_committee_approval' || 
      l.status === 'pending_principal_approval'
    ).length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => 
      l.status === 'rejected_by_examination_committee' || 
      l.status === 'rejected_by_timetable_committee' || 
      l.status === 'rejected_by_principal'
    ).length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getLeaveStats();

  return (
    <div className="flex-1 flex flex-col">
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
            <>
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

              {/* Leave Balance Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Balance (Current Year)</h3>
                    <p className="text-sm text-gray-600">Annual quota: 12 days | Monthly limit: 2 days</p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#002e5d]" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{leaveStats.totalLeavesUsed}/12</div>
                    <p className="text-sm text-blue-800">Leaves Used</p>
                  </div>
                  <div className={`border rounded-lg p-4 text-center ${
                    leaveStats.remainingLeaves >= 8 ? 'bg-green-50 border-green-200' :
                    leaveStats.remainingLeaves >= 4 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-1 ${getLeaveStatusColor(leaveStats.remainingLeaves)}`}>
                      {leaveStats.remainingLeaves}
                    </div>
                    <p className={`text-sm ${getLeaveStatusColor(leaveStats.remainingLeaves)}`}>Remaining Leaves</p>
                  </div>
                  <div className={`border rounded-lg p-4 text-center ${
                    leaveStats.totalLOP === 0 ? 'bg-green-50 border-green-200' :
                    leaveStats.totalLOP <= 2 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-1 ${getLOPStatusColor(leaveStats.totalLOP)}`}>
                      {leaveStats.totalLOP}
                    </div>
                    <p className={`text-sm ${getLOPStatusColor(leaveStats.totalLOP)}`}>LOP Days</p>
                  </div>
                </div>
                
                {leaveStats.totalLOP > 0 && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm font-medium text-red-900">
                        LOP Notice: You have {leaveStats.totalLOP} day(s) of Loss of Pay due to exceeding monthly leave limits.
                      </p>
                    </div>
                    <p className="text-xs text-red-800 mt-1">
                      Monthly limit: 2 leaves per month. Excess leaves are considered LOP.
                    </p>
                  </div>
                )}
              </div>

              {/* Monthly Breakdown */}
              {leaveStats.monthlyBreakdown.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Leave Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leaveStats.monthlyBreakdown.map((month, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{month.monthName}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valid Leaves:</span>
                            <span className="font-medium text-blue-600">{month.leavesUsed} days</span>
                          </div>
                          {month.lopDays > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">LOP Days:</span>
                              <span className="font-medium text-red-600">{month.lopDays} days</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-gray-300">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Taken:</span>
                              <span className="font-medium text-gray-900">{month.leavesUsed + month.lopDays} days</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
                              <span><strong>Type:</strong> {leave.leaveType === 'OD' ? 'On Duty (OD)' : 'Casual'}</span>
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
                              <div className="flex items-center space-x-2 mb-1">
                                <MessageSquare className="h-4 w-4" />
                                <p className="text-sm font-medium text-blue-900">Legacy Review Comments:</p>
                              </div>
                              <p className="text-sm text-blue-800">{leave.comments}</p>
                              {leave.reviewedBy && (
                                <p className="text-xs text-blue-600 mt-2">
                                  Reviewed by {leave.reviewedBy} on {leave.reviewedDate}
                                </p>
                              )}
                            </div>
                          )}

                          {leave.examCommitteeComments && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center space-x-2 mb-1">
                                <MessageSquare className="h-4 w-4" />
                                <p className="text-sm font-medium text-yellow-900">Examination Committee Comments:</p>
                              </div>
                              <p className="text-sm text-yellow-800">{leave.examCommitteeComments}</p>
                              {leave.examCommitteeReviewedBy && (
                                <p className="text-xs text-yellow-600 mt-2">
                                  Reviewed by {leave.examCommitteeReviewedBy} on {leave.examCommitteeReviewedDate}
                                </p>
                              )}
                            </div>
                          )}
                          {leave.timetableCommitteeComments && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center space-x-2 mb-1">
                                <MessageSquare className="h-4 w-4" />
                                <p className="text-sm font-medium text-orange-900">Timetable Committee Comments:</p>
                              </div>
                              <p className="text-sm text-orange-800">{leave.timetableCommitteeComments}</p>
                              {leave.timetableCommitteeReviewedBy && (
                                <p className="text-xs text-orange-600 mt-2">
                                  Reviewed by {leave.timetableCommitteeReviewedBy} on {leave.timetableCommitteeReviewedDate}
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