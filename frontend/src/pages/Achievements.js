import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Award, Lock, Star, Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { leaderboardAPI } from '../services/api';

const Achievements = () => {
  const [achievements, setAchievements] = useState({ unlocked: [], locked: [], progress: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    if (authUser?.id) {
      loadAchievements();
    }
  }, [authUser]);

  const loadAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leaderboardAPI.getUserAchievements(authUser.id);
      setAchievements(response.data.data);
    } catch (err) {
      setError('Failed to load achievements');
      console.error('Achievements error:', err);
    }
    setLoading(false);
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'completion':
        return <Target className="w-6 h-6" />;
      case 'points_milestone':
        return <Star className="w-6 h-6" />;
      case 'streak':
        return <Calendar className="w-6 h-6" />;
      case 'ranking':
        return <Trophy className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'uncommon':
        return 'border-green-300 bg-green-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Award className="w-8 h-8" />
              Achievements
            </h1>
            <p className="text-purple-100 mt-2">Track your learning milestones and unlock rewards</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{achievements.progress.unlocked_count || 0}</div>
            <div className="text-purple-100">Unlocked</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Progress
          </h2>
          <div className="text-sm text-gray-600">
            {achievements.progress.completion_percentage || 0}% Complete
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${achievements.progress.completion_percentage || 0}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{achievements.progress.unlocked_count || 0}</div>
            <div className="text-sm text-gray-600">Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{achievements.locked?.length || 0}</div>
            <div className="text-sm text-gray-600">Locked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{achievements.progress.total_count || 0}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-green-600" />
          Unlocked Achievements
          <span className="text-sm text-gray-500 font-normal">({achievements.unlocked?.length || 0})</span>
        </h2>
        
        {achievements.unlocked?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No achievements unlocked yet. Start learning to earn your first achievement!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.unlocked.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} transform hover:scale-105 transition-all duration-200`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    {getAchievementIcon(achievement.achievement_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {achievement.points_reward > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            +{achievement.points_reward} pts
                          </span>
                        )}
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">
                          {achievement.rarity || 'common'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Unlocked {formatDate(achievement.unlocked_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-600" />
          Locked Achievements
          <span className="text-sm text-gray-500 font-normal">({achievements.locked?.length || 0})</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.locked?.map((achievement) => (
            <div 
              key={achievement.id} 
              className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-75 hover:opacity-100 transition-opacity duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-200 rounded-full">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-700">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {achievement.points_reward > 0 && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          +{achievement.points_reward} pts
                        </span>
                      )}
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full capitalize">
                        {achievement.rarity || 'common'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {achievement.achievement_type === 'completion' && (
                      `Complete ${achievement.criteria_value} ${achievement.name.includes('course') ? 'courses' : 'projects'}`
                    )}
                    {achievement.achievement_type === 'points_milestone' && (
                      `Reach ${achievement.criteria_value.toLocaleString()} points`
                    )}
                    {achievement.achievement_type === 'streak' && (
                      `Maintain ${achievement.criteria_value} day streak`
                    )}
                    {achievement.achievement_type === 'ranking' && (
                      `Reach top ${achievement.criteria_value} ranking`
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
};

export default Achievements;