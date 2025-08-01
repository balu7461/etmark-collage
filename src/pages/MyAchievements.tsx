import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AchievementForm } from '../components/Achievements/AchievementForm';
import { Achievement } from '../types';
import { Award, Star, ExternalLink, Plus, Calendar } from 'lucide-react';

export function MyAchievements() {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMyAchievements();
  }, [currentUser]);

  const fetchMyAchievements = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'achievements'),
        where('facultyId', '==', currentUser.id)
      );
      const querySnapshot = await getDocs(q);
      const achievementsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Achievement[];
      
      // Sort by submittedDate in descending order (newest first)
      achievementsData.sort((a, b) => {
        const dateA = new Date(a.submittedDate);
        const dateB = new Date(b.submittedDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'award':
        return <Award className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Achievements</h1>
              <p className="text-gray-600">
                Track and manage your professional achievements and certifications.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#002e5d] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{showForm ? 'View Achievements' : 'Add Achievement'}</span>
            </button>
          </div>

          {showForm ? (
            <AchievementForm />
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002e5d]"></div>
                </div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                  <p className="text-gray-600">Start by adding your first achievement or certification.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(achievement.type)}`}>
                            {getTypeIcon(achievement.type)}
                            <span className="capitalize">{achievement.type}</span>
                          </span>
                        </div>
                        {achievement.isTopPerformer && (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-xs font-medium">Top Performer</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                      
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
                          className="inline-flex items-center space-x-2 text-[#002e5d] hover:text-blue-800 text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Certificate</span>
                        </a>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Submitted on {achievement.submittedDate}
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