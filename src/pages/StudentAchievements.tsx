import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StudentAchievement } from '../types';
import { Award, Star, ExternalLink, Filter, Calendar, TrendingUp, Plus, Trophy, MapPin, User, Trash2 } from 'lucide-react';
import { StudentAchievementForm } from '../components/Achievements/StudentAchievementForm';
import toast from 'react-hot-toast';

export function StudentAchievements() {
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Sports' | 'Cultural' | 'Academic' | 'Other'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const q = query(collection(db, 'studentAchievements'), orderBy('submittedDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const achievementsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudentAchievement[];
      
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Error fetching student achievements:', error);
      toast.error('Failed to fetch student achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (achievementId: string) => {
    if (window.confirm('Are you sure you want to delete this student achievement?')) {
      try {
        await deleteDoc(doc(db, 'studentAchievements', achievementId));
        toast.success('Student achievement deleted successfully');
        fetchAchievements();
      } catch (error) {
        console.error('Error deleting student achievement:', error);
        toast.error('Failed to delete student achievement');
      }
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    return achievement.category === filter;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sports':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cultural':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Other':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sports':
        return <Trophy className="h-4 w-4" />;
      case 'Cultural':
        return <Star className="h-4 w-4" />;
      case 'Academic':
        return <Award className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getAchievementStats = () => {
    const total = achievements.length;
    const byCategory = {
      Sports: achievements.filter(a => a.category === 'Sports').length,
      Cultural: achievements.filter(a => a.category === 'Cultural').length,
      Academic: achievements.filter(a => a.category === 'Academic').length,
      Other: achievements.filter(a => a.category === 'Other').length,
    };
    
    return { total, byCategory };
  };

  const stats = getAchievementStats();

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Achievement Management</h1>
              <p className="text-gray-600">Manage and track student achievements across all categories</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#002e5d] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{showForm ? 'View Achievements' : 'Add Achievement'}</span>
            </button>
          </div>

          {!showForm && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sports</p>
                      <p className="text-3xl font-bold text-green-600">{stats.byCategory.Sports}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cultural</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.byCategory.Cultural}</p>
                    </div>
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Academic</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.byCategory.Academic}</p>
                    </div>
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Other</p>
                      <p className="text-3xl font-bold text-gray-600">{stats.byCategory.Other}</p>
                    </div>
                    <Award className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">Filter by Category</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(['all', 'Sports', 'Cultural', 'Academic', 'Other'] as const).map(category => (
                    <button
                      key={category}
                      onClick={() => setFilter(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === category
                          ? 'bg-[#002e5d] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {showForm ? (
            <StudentAchievementForm />
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
                </div>
              ) : filteredAchievements.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No student achievements found</h3>
                  <p className="text-gray-600">No achievements found for the selected filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(achievement.category)}`}>
                            {getCategoryIcon(achievement.category)}
                            <span>{achievement.category}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(achievement.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete achievement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                      
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <User className="h-4 w-4" />
                          <span>{achievement.studentName}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Branch:</span> {achievement.branch}
                        </div>
                      </div>

                      {achievement.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{achievement.description}</p>
                      )}

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{achievement.date}</span>
                        </div>
                        {achievement.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{achievement.location}</span>
                          </div>
                        )}
                        {achievement.outcome && (
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4" />
                            <span>{achievement.outcome}</span>
                          </div>
                        )}
                      </div>

                      {achievement.highlightPhotosLink && (
                        <a
                          href={achievement.highlightPhotosLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-[#002e5d] hover:text-blue-800 text-sm font-medium mb-4"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Photos</span>
                        </a>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Added on {achievement.submittedDate}
                        </p>
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