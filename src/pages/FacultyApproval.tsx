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
      // Fetch pending faculty and committee members
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

      // Fetch approved faculty and committee members
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

      const roleDisplay = getRoleDisplayName(userRole);
      toast.success(`${roleDisplay} ${userName} has been approved successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId: string, userName: string, userRole: string) => {
    const roleDisplay = getRoleDisplayName(userRole);
    
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
    const roleDisplay = getRoleDisplayName(userRole);
    
    if (window.confirm(`Are you sure you want to revoke ${roleDisplay} ${userName}'s approval? This will deactivate their account.`)) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isApproved: false,
          approvedBy: null,
          approvedDate: null
        });
        toast.success(`${roleDisplay} ${userName}'s approval has been revoked.`);
        fetchUsers();
      } catch (error) {
        console.error('Error revoking approval:', error);
        toast.error('Failed to revoke approval');
      }
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'Faculty';
      case 'committee_member':
        return 'Committee Member';
      case 'timetable_committee':
        return 'Timetable Committee';
      case 'examination_committee':
        return 'Examination Committee';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'faculty':
        return <UserCheck className="h-4 w-4" />;
      case 'committee_member':
        return <Shield className="h-4 w-4" />;
      case 'timetable_committee':
        return <Calendar className="h-4 w-4" />;
      case 'examination_committee':
        return <Crown className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'committee_member':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'timetable_committee':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'examination_committee':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (role: string) => {
    switch (role) {
      case 'timetable_committee':
      case 'examination_committee':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="h-3 w-3" />
            <span>High Priority</span>
          </span>
        );
      case 'committee_member':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="h-3 w-3" />
            <span>Medium Priority</span>
          </span>
        );
      default:
        return null;
    }
  };

  const currentUsers = filter === 'pending' ? pendingUsers : approvedUsers;

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Faculty & Committee Approval</h1>
            <p className="text-gray-600">
              Review and approve faculty and committee member registrations
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  filter === 'pending'
                    ? 'bg-[#002e5d] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Pending Approval ({pendingUsers.length})</span>
                </div>
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  filter === 'approved'
                    ? 'bg-[#002e5d] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Approved ({approvedUsers.length})</span>
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
            ) : currentUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filter === 'pending' ? 'pending' : 'approved'} users
                </h3>
                <p className="text-gray-600">
                  {filter === 'pending' 
                    ? 'All user applications have been processed.' 
                    : 'No users have been approved yet.'
                  }
                </p>
              </div>
            ) : (
              currentUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span>{getRoleDisplayName(user.role)}</span>
                        </span>
                        {getPriorityBadge(user.role)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.department && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{user.department}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Registered: {user.registrationDate}</span>
                        </div>
                      </div>

                      {user.approvedBy && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-green-900 mb-1">Approval Details:</p>
                          <p className="text-sm text-green-800">
                            Approved by {user.approvedBy} on {user.approvedDate}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-6">
                      {filter === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(user.id, user.name, user.role)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
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
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
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