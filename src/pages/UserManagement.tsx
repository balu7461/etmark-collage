import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Student, Department } from '../types';
import { Users, Edit2, Trash2, Search, Filter, UserCheck, UserX, Building, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { ALL_CLASSES, getYearsForClass } from '../utils/constants';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'faculty' | 'timetable_committee' | 'examination_committee' | 'achievements_committee'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'faculty' as 'admin' | 'faculty' | 'timetable_committee' | 'examination_committee' | 'achievements_committee'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Fetch students
      const studentsQuery = query(
        collection(db, 'students'),
        where('isApproved', '==', true)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];

      // Filter students to only include those from valid classes and years
      const validStudents = studentsData.filter(student => {
        if (!ALL_CLASSES.includes(student.class)) {
          return false;
        }
        const validYears = getYearsForClass(student.class);
        if (validYears.length > 0 && !validYears.includes(student.year)) {
          return false;
        }
        return true;
      });

      setUsers(usersData);
      setStudents(validStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        name: editFormData.name,
        phone: editFormData.phone,
        role: editFormData.role
      });

      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userEmail === 'hiddencave168@gmail.com') {
      toast.error('Cannot delete the main admin account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast.success('User deleted successfully');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'faculty':
        return 'Faculty';
      case 'timetable_committee':
        return 'Timetable Committee';
      case 'examination_committee':
        return 'Examination Committee';
      case 'achievements_committee':
        return 'Achievements Committee';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const totalStudents = students.length;
    const approvedUsers = users.filter(u => u.isApproved).length;
    const pendingUsers = users.filter(u => !u.isApproved).length;
    
    const roleStats = {
      admin: users.filter(u => u.role === 'admin').length,
      faculty: users.filter(u => u.role === 'faculty').length,
      timetable_committee: users.filter(u => u.role === 'timetable_committee').length,
      examination_committee: users.filter(u => u.role === 'examination_committee').length,
      achievements_committee: users.filter(u => u.role === 'achievements_committee').length,
    };

    return { totalUsers, totalStudents, approvedUsers, pendingUsers, roleStats };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const stats = getStats();

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage all users and students in the system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Users</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Users</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingUsers}</p>
                </div>
                <UserX className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Role Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Role Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.roleStats.admin}</div>
                <p className="text-sm text-gray-600">Administrators</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.roleStats.faculty}</div>
                <p className="text-sm text-gray-600">Faculty</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.roleStats.timetable_committee}</div>
                <p className="text-sm text-gray-600">Timetable Committee</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.roleStats.examination_committee}</div>
                <p className="text-sm text-gray-600">Examination Committee</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.roleStats.achievements_committee}</div>
                <p className="text-sm text-gray-600">Achievements Committee</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Filter Users</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrator</option>
                  <option value="faculty">Faculty</option>
                  <option value="timetable_committee">Timetable Committee</option>
                  <option value="examination_committee">Examination Committee</option>
                  <option value="achievements_committee">Achievements Committee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Users ({filteredUsers.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {user.email !== 'hiddencave168@gmail.com' && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit User</h3>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="faculty">Faculty</option>
                    <option value="timetable_committee">Timetable Committee</option>
                    <option value="examination_committee">Examination Committee</option>
                    <option value="achievements_committee">Achievements Committee</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}