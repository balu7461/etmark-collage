import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Layout/Header';
import { User } from '../types';
import { UserCheck, UserX, Clock, CheckCircle, XCircle, Mail, Phone, Building, Calendar, Crown, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function FacultyApproval() {
  const { currentUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch pending faculty and HODs
      const pendingQuery = query(
        collection(db, 'users'),
        where('isApproved', '==', false)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingData = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Filter out admin users and main admin
      const filteredPending = pendingData.filter(user => 
        user.role !== 'admin' && user.email !== 'hiddencave168@gmail.com'
      );

      // Fetch approved faculty and HODs
      const approvedQuery = query(
        collection(db, 'users'),
        where('isApproved', '==', true)
      );
      const approvedSnapshot = await getDocs(approvedQuery);
      const approvedData = approvedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Filter out admin users and main admin
      const filteredApproved = approvedData.filter(user => 
        user.role !== 'admin' && user.email !== 'hiddencave168@gmail.com'
      );

      setPendingUsers(filteredPending);
      setApprovedUsers(filteredApproved);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, userName: string, userRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: true,
        approvedBy: currentUser?.name,
        approvedDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      });

      const roleDisplay = userRole === 'hod' ? 'HOD' : 'Faculty';
      toast.success(`${roleDisplay} ${userName} has been approved successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId: string, userName: string, userRole: string) => {
    const roleDisplay = userRole === 'hod' ? 'HOD' : 'Faculty';
    
    if (window.confirm(`Are you sure you want to reject ${roleDisplay} ${userName}'s application? This will permanently delete their account.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast.success(`${roleDisplay} ${userName}'s application has been rejected and account deleted.`);
        fetchUsers();
      } catch (error) {
        console.error('Error rejecting user:', error);
        toast.error('Failed to reject user application');
      }
    }
  };

  const handleRevoke = async (userId: string, userName: string, userRole: string) => {
    const roleDisplay = userRole === 'hod' ? 'HOD' : 'Faculty';
    
    if (window.confirm(`Are you sure you want to revoke approval for ${roleDisplay} ${userName}? They will no longer be able to login.`)) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isApproved: false,
          approvedBy: null,
          approvedDate: null
        });

        toast.success(`Approval revoked for ${roleDisplay} ${userName}`);
        fetchUsers();
      } catch (error) {
        console.error('Error revoking approval:', error);
        toast.error('Failed to revoke approval');
      }
    }
  };

  const stats = {
    pending: pendingUsers.length,
    approved: approvedUsers.length,
    total: pendingUsers.length + approvedUsers.length,
    pendingFaculty: pendingUsers.filter(u => u.role === 'faculty').length,
    pendingHOD: pendingUsers.filter(u => u.role === 'hod').length,
    approvedFaculty: approvedUsers.filter(u => u.role === 'faculty').length,
    approvedHOD: approvedUsers.filter(u => u.role === 'hod').length
  };

  const displayedUsers = filter === 'pending' ? pendingUsers : approvedUsers;

  const getRoleIcon = (role: string) => {
    return role === 'committee_member' ? <Crown className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />;
  };

  const getRoleColor = (role: string) => {
    return role === 'committee_member' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPriorityBadge = (role: string) => {
    if (role === 'committee_member') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="h-3 w-3" />
          <span>High Priority</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Faculty & HOD Approval Management</h1>
            <p className="text-gray-600">Review and approve faculty and HOD registration requests</p>
            
            {/* Admin Notice */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Admin Approval System</p>
                  <p className="text-blue-700">
                    All new faculty and HOD accounts require your approval before they can access the system. 
                    HOD accounts are marked as high priority and require special attention.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Total</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              {stats.pendingHOD > 0 && (
                <div className="mt-2 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">{stats.pendingHOD} HOD pending</span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Faculty</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.pendingFaculty}</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending HODs</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.pendingHOD}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              {stats.pendingHOD > 0 && (
                <div className="mt-2 text-xs text-purple-600 font-medium">Requires immediate attention</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Total</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <UserCheck className="h-8 w-8 text-gray-600" />
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
                  {stats.pendingCommittee > 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  Faculty: {stats.pendingFaculty} • Committee: {stats.pendingCommittee}
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
                <div className="text-xs mt-1 opacity-75">
                  Faculty: {stats.approvedFaculty} • Committee: {stats.approvedCommittee}
                </div>
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
              </div>
            ) : displayedUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                {filter === 'pending' ? (
                  <>
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                    <p className="text-gray-600">All faculty and HOD registrations have been processed.</p>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No approved users</h3>
                    <p className="text-gray-600">No faculty or HOD members have been approved yet.</p>
                  </>
                )}
              </div>
            ) : (
              // Sort HODs first in pending list
              [...displayedUsers]
                .sort((a, b) => {
                  if (filter === 'pending') {
                    if (a.role === 'committee_member' && b.role !== 'committee_member') return -1;
                    if (a.role !== 'committee_member' && b.role === 'committee_member') return 1;
                  }
                  return 0;
                })
                .map((user) => (
                <div key={user.id} className={`bg-white rounded-xl shadow-sm border p-6 transform transition-all duration-200 hover:shadow-md ${
                  user.role === 'committee_member' && !user.isApproved ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role === 'committee_member' ? 'Committee Member' : user.role}</span>
                        </span>
                        {getPriorityBadge(user.role)}
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${
                          user.isApproved 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {user.isApproved ? (
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
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building className="h-4 w-4" />
                          <span>{user.department}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Registered: {user.registrationDate}</span>
                        </div>
                      </div>

                      {user.role === 'hod' && !user.isApproved && (
                        <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Committee Member Account - Requires Special Attention</p>
                              <p className="text-xs text-red-700">
                                This is a Committee Member application. Please verify credentials carefully before approval.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {user.isApproved && user.approvedBy && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            <strong>Approved by:</strong> {user.approvedBy} on {user.approvedDate}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex space-x-2">
                      {!user.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(user.id, user.name, user.role)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve {user.role === 'committee_member' ? 'Committee Member' : 'Faculty'}</span>
                          </button>
                          <button
                            onClick={() => handleReject(user.id, user.name, user.role)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRevoke(user.id, user.name, user.role)}
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