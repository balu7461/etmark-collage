import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { StudentAchievement } from '../types';
import { Award, Star, TrendingUp, Users, Calendar, Trophy, Plus, BarChart3 } from 'lucide-react';

export function AchievementsCommitteeDashboard() {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementStats = () => {
    const total = achievements.length;
    const thisMonth = achievements.filter(a => {
      const achievementDate = new Date(a.submittedDate);
      const now = new Date();
      return achievementDate.getMonth() === now.getMonth() && 
             achievementDate.getFullYear() === now.getFullYear();
    }).length;
    
    const byCategory = {
      Sports: achievements.filter(a => a.category === 'Sports').length,
      Cultural: achievements.filter(a => a.category === 'Cultural').length,
      Academic: achievements.filter(a => a.category === 'Academic').length,
      Other: achievements.filter(a => a.category === 'Other').length,
    };
    
    const uniqueStudents = new Set(achievements.map(a => a.studentId)).size;
    
    return { total, thisMonth, byCategory, uniqueStudents };
  };

  const getRecentAchievements = () => {
    return achievements.slice(0, 5);
  };

  const stats = getAchievementStats();
  const recentAchievements = getRecentAchievements();

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-sm lg:text-base text-gray-600">
              Here's what's happening in student achievements today.
            </p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              Role: Achievements Committee
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.thisMonth}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.uniqueStudents}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sports Achievements</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.byCategory.Sports}</p>
                </div>
                <Trophy className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Category Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Achievement Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.byCategory.Sports}</p>
                <p className="text-sm text-gray-600">Sports</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{stats.byCategory.Cultural}</p>
                <p className="text-sm text-gray-600">Cultural</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{stats.byCategory.Academic}</p>
                <p className="text-sm text-gray-600">Academic</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-600">{stats.byCategory.Other}</p>
                <p className="text-sm text-gray-600">Other</p>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Achievements</h3>
              <a 
                href="/student-achievements" 
                className="text-[#002e5d] hover:text-blue-800 text-sm font-medium"
              >
                View All
              </a>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002e5d]"></div>
              </div>
            ) : recentAchievements.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h4>
                <p className="text-gray-600">Start by adding student achievements.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${
                      achievement.category === 'Sports' ? 'bg-green-100' :
                      achievement.category === 'Cultural' ? 'bg-purple-100' :
                      achievement.category === 'Academic' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {achievement.category === 'Sports' ? (
                        <Trophy className="h-5 w-5 text-green-600" />
                      ) : achievement.category === 'Cultural' ? (
                        <Star className="h-5 w-5 text-purple-600" />
                      ) : achievement.category === 'Academic' ? (
                        <Award className="h-5 w-5 text-blue-600" />
                      ) : (
                        <BarChart3 className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">
                        {achievement.studentName} • {achievement.branch} • {achievement.date}
                      </p>
                      {achievement.outcome && (
                        <p className="text-xs text-gray-500">{achievement.outcome}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      achievement.category === 'Sports' ? 'bg-green-100 text-green-800' :
                      achievement.category === 'Cultural' ? 'bg-purple-100 text-purple-800' :
                      achievement.category === 'Academic' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {achievement.category}
                    </span>
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