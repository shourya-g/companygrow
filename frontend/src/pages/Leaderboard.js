import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users, 
  Calendar,
  Clock,
  Star,
  Target,
  Filter,
  Download
} from 'lucide-react';
import { leaderboardAPI } from '../services/api';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState({ unlocked: [], locked: [], progress: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedPeriod, selectedDepartment]);

  useEffect(() => {
    if (authUser?.id) {
      loadUserData();
    }
  }, [authUser, selectedPeriod]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      let leaderboardRes;
      if (selectedDepartment === 'all') {
        leaderboardRes = await leaderboardAPI.getLeaderboard(selectedPeriod);
      } else {
        leaderboardRes = await leaderboardAPI.getDepartmentLeaderboard(selectedDepartment, selectedPeriod);
      }
      
      const statsRes = await leaderboardAPI.getStats();
      const activityRes = await leaderboardAPI.getRecentActivity();
      
      setLeaderboardData(leaderboardRes.data.data.leaderboard);
      setStats(statsRes.data.data);
      setRecentActivity(activityRes.data.data);
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error('Leaderboard error:', err);
    }
    setLoading(false);
  };

  const loadUserData = async () => {
    try {
      const positionRes = await leaderboardAPI.getUserPosition(authUser.id, selectedPeriod);
      const achievementsRes = await leaderboardAPI.getUserAchievements(authUser.id);
      
      setUserPosition(positionRes.data.data);
      setAchievements(achievementsRes.data.data);
    } catch (err) {
      console.error('User data error:', err);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
    if (rank === 2) return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
    if (rank === 3) return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
    return "bg-white border-gray-200";
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const departments = [...new Set(leaderboardData.map(entry => entry.user.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              Leaderboard
            </h1>
            <p className="text-blue-100 mt-2">Compete, learn, and climb the ranks!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats?.overview.active_users || 0}</div>
            <div className="text-blue-100">Active Competitors</div>
          </div>
        </div>
      </div>

      {/* User Position Card */}
      {userPosition && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getRankIcon(userPosition.rank)}
                <div>
                  <div className="font-semibold text-lg">Your Position</div>
                  <div className="text-gray-600">Rank #{userPosition.rank}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{userPosition.points}</div>
                <div className="text-sm text-gray-600">
                  {selectedPeriod === 'all' ? 'Total Points' : 
                   selectedPeriod === 'monthly' ? 'Monthly Points' : 'Quarterly Points'}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{userPosition.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{achievements.progress.unlocked_count}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
              </select>

              <select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {selectedDepartment === 'all' ? 'Global' : selectedDepartment} Leaderboard
                <span className="text-sm text-gray-500">
                  ({selectedPeriod === 'all' ? 'All Time' : 
                    selectedPeriod === 'monthly' ? 'Monthly' : 'Quarterly'})
                </span>
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {leaderboardData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No participants found for the selected period.</p>
                </div>
              ) : (
                leaderboardData.map((entry) => (
                  <div 
                    key={entry.user.id} 
                    className={`p-4 flex items-center justify-between border-l-4 ${getRankStyle(entry.rank)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(entry.rank)}
                        <div>
                          <div className="font-semibold">
                            {entry.user.first_name} {entry.user.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.user.department} • {entry.user.position}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{entry.points}</div>
                        <div className="text-xs text-gray-500">Points</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{entry.coursesCompleted}</div>
                        <div className="text-xs text-gray-500">Courses</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{entry.projectsCompleted}</div>
                        <div className="text-xs text-gray-500">Projects</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium flex items-center gap-1">
                          {entry.currentStreak > 0 && <span>🔥</span>}
                          {entry.currentStreak}
                        </div>
                        <div className="text-xs text-gray-500">Streak</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Overview
            </h3>
            
            {stats && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Participants</span>
                  <span className="font-semibold">{stats.overview.total_users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active This Period</span>
                  <span className="font-semibold">{stats.overview.active_users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Participation Rate</span>
                  <span className="font-semibold">{stats.overview.participation_rate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Points</span>
                  <span className="font-semibold">{stats.overview.average_points}</span>
                </div>
                
                {stats.top_performer && (
                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600 mb-1">🏆 Top Performer</div>
                    <div className="font-semibold">{stats.top_performer.name}</div>
                    <div className="text-sm text-gray-600">{stats.top_performer.points} points</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {activity.user.first_name} {activity.user.last_name}
                    </div>
                    <div className="text-gray-600 truncate">
                      +{activity.points_earned} points • {activity.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Achievements
            </h3>
            
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-purple-600">
                {achievements.progress.unlocked_count || 0}
              </div>
              <div className="text-sm text-gray-600">
                of {achievements.progress.total_count || 0} unlocked
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${achievements.progress.completion_percentage || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              {achievements.unlocked.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{achievement.name}</div>
                   <div className="text-xs text-gray-600 truncate">{achievement.description}</div>
                 </div>
               </div>
             ))}
             
             {achievements.locked.slice(0, 2).map((achievement) => (
               <div key={achievement.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded opacity-75">
                 <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                   <Award className="w-4 h-4 text-gray-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="font-medium text-sm text-gray-600">{achievement.name}</div>
                   <div className="text-xs text-gray-500 truncate">{achievement.description}</div>
                 </div>
               </div>
             ))}
           </div>
           
           <button 
             onClick={() => window.location.href = '/achievements'}
             className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
           >
             View All Achievements →
           </button>
         </div>
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

export default Leaderboard;