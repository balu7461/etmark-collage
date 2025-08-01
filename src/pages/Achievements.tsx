import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Achievement } from '../types';
import { Award, Star, ExternalLink, Filter, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'certification' | 'publication' | 'award' | 'training' | 'workshop'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const q = query(collection(db, 'achievements'), orderBy('submittedDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const achievementsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Achievement[];
      
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopPerformer = async (achievementId: string, isTopPerformer: boolean) => {
    try {
      await updateDoc(doc(db, 'achievements', achievementId), {
        isTopPerformer: !isTopPerformer
      });

      toast.success(
        !isTopPerformer 
          ? 'Marked as top performer!' 
          : 'Removed from top performers'
      );
      
      fetchAchievements();
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast.error('Failed to update achievement');
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    return achievement.type === filter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'certification':
        return 'bg-blue-100 text-blue-800';
      case 'publication':
        return 'bg-green-100 text-green-800';
      case 'award':
        return 'bg-yellow-100 text-yellow-800';
      case 'training':
        return 'bg-purple-100 text-purple-800';
      case 'workshop':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAchievementStats = () => {
    const total = achievements.length;
    const topPerformers = achievements.filter(a => a.isTopPerformer).length;
    const byType = {
      certification: achievements.filter(a => a.type === 'certification').length,
      publication: achievements.filter(a => a.type === 'publication').length,
      award: achievements.filter(a => a.type === 'award').length,
      training: achievements.filter(a => a.type === 'training').length,
      workshop: achievements.filter(a => a.type === 'workshop').length,
    };
    
    return { total, topPerformers, byType };
  };

  const stats = getAchievementStats();

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Achievement Management</h1>
            <p className="text-gray-600">Review faculty achievements and mark top performers</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  <p className="text-sm font-medium text-gray-600">Top Performers</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.topPerformers}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publications</p>
                  <p className="text-3xl font-bold text-green-600">{stats.byType.publication}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certifications</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.byType.certification}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Filter by Type</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(['all', 'certification', 'publication', 'award', 'training', 'workshop'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === type
                      ? 'bg-[#002e5d] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
                <p className="text-gray-600">No achievements found for the selected filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(achievement.type)}`}>
                          <Award className="h-4 w-4" />
                          <span className="capitalize">{achievement.type}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => toggleTopPerformer(achievement.id, achievement.isTopPerformer)}
                        className={`p-2 rounded-full transition-colors ${
                          achievement.isTopPerformer
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={achievement.isTopPerformer ? 'Remove from top performers' : 'Mark as top performer'}
                      >
                        <Star className={`h-4 w-4 ${achievement.isTopPerformer ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Faculty: {achievement.facultyName}</p>
                    </div>

                    {achievement.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{achievement.description}</p>
                    )}

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{achievement.date}</span>
                    </div>

                    {achievement.fileUrl && (
                      <a
                        href={achievement.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-[#002e5d] hover:text-blue-800 text-sm font-medium mb-4"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Certificate</span>
                      </a>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Submitted on {achievement.submittedDate}
                      </p>
                      {achievement.isTopPerformer && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-xs font-medium">Top Performer</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}