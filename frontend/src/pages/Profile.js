import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { usersAPI, badgesAPI, handleApiError } from '../services/api';
import UserSkillManagement from '../components/UserSkillManagement';
import { 
  User, Mail, Calendar, Briefcase, 
  TrendingUp, Award, BookOpen, LogOut, Edit,
  CheckCircle, Star, Phone, MapPin
} from 'lucide-react';
import { calculatePortfolioScore } from '../utils/portfolio';

const Profile = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user && user.id) {
      loadUserProfile();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load comprehensive user profile data
      const profileResponse = await usersAPI.getProfile(user.id);
      setUserProfile(profileResponse.data.data);
      
      // Extract skills from profile data
      if (profileResponse.data.data.Skills) {
        setUserSkills(profileResponse.data.data.Skills);
      }

      // Load user badges
      try {
        const badgesResponse = await badgesAPI.getUserBadges(user.id);
        const badgeData = badgesResponse.data.data || [];
        // Filter to only show earned badges (those with UserBadges array)
        const earnedBadges = badgeData.filter(badge => badge.UserBadges && badge.UserBadges.length > 0);
        setUserBadges(earnedBadges);
      } catch (badgeErr) {
        console.error('Failed to load user badges:', badgeErr);
        setUserBadges([]);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      
      // Fallback to basic user data
      setUserProfile(user);
      setUserSkills([]);
      setUserBadges([]);
    }
    
    setLoading(false);
  };

  const handleSkillsChange = (newSkills) => {
    setUserSkills(newSkills);
    
    // Update user profile skills as well
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        Skills: newSkills
      });
    }
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      department: user.department || '',
      position: user.position || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await usersAPI.update(user.id, editForm);
      setEditing(false);
      
      // Reload profile to get updated data
      await loadUserProfile();
      
      // You might want to dispatch an action to update the auth state as well
      window.location.reload(); // Simple approach for now
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    
    setSaving(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getBadgeRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateSkillStats = () => {
    if (!userSkills || userSkills.length === 0) {
      return {
        totalSkills: 0,
        verifiedSkills: 0,
        averageProficiency: 0,
        portfolioScore: 0,
        topCategories: [],
        totalBadges: userBadges.length,
        badgesByRarity: {}
      };
    }

    const verifiedSkills = userSkills.filter(skill => skill.is_verified).length;
    const averageProficiency = userSkills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / userSkills.length;
    const portfolioScore = calculatePortfolioScore(userSkills);
    
    // Calculate category distribution
    const categoryCount = {};
    userSkills.forEach(skill => {
      const category = skill.category || 'other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    // Calculate badge statistics
    const badgesByRarity = {};
    userBadges.forEach(badge => {
      const rarity = badge.rarity || 'common';
      badgesByRarity[rarity] = (badgesByRarity[rarity] || 0) + 1;
    });

    return {
      totalSkills: userSkills.length,
      verifiedSkills,
      averageProficiency: Math.round(averageProficiency * 10) / 10,
      portfolioScore,
      topCategories,
      totalBadges: userBadges.length,
      badgesByRarity
    };
  };

  const skillStats = calculateSkillStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No User Found</h1>
            <p className="text-gray-600 mb-4">Please login to view your profile.</p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayProfile = userProfile || user;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section with Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-8 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center ring-4 ring-white/30">
                  <User className="w-12 h-12 text-white" />
                </div>
                
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">
                    {displayProfile.first_name && displayProfile.last_name 
                      ? `${displayProfile.first_name} ${displayProfile.last_name}` 
                      : displayProfile.name || displayProfile.email}
                  </h1>
                  <div className="space-y-2 text-blue-100">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{displayProfile.email}</span>
                    </div>
                    {displayProfile.position && displayProfile.department && (
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span>{displayProfile.position} • {displayProfile.department}</span>
                      </div>
                    )}
                    {displayProfile.hire_date && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Joined {new Date(displayProfile.hire_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/browse-profiles"
                  className="flex items-center px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
                >
                  <User className="w-4 h-4 mr-2" />
                  Browse Profiles
                </Link>
                <button
                  onClick={handleEditProfile}
                  className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="text-red-600">{error}</div>
          </div>
        )}

        {/* Stats Cards - Improved Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold text-gray-900">{skillStats.totalSkills}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{skillStats.verifiedSkills}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Score</p>
                <p className="text-2xl font-bold text-gray-900">{skillStats.portfolioScore}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-gray-900">{skillStats.totalBadges}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position
                        </label>
                        <input
                          type="text"
                          value={editForm.position}
                          onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Role</span>
                      <span className="text-sm text-gray-900 capitalize font-medium">{displayProfile.role}</span>
                    </div>
                    
                    {displayProfile.phone && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-600">Phone</span>
                        </div>
                        <span className="text-sm text-gray-900">{displayProfile.phone}</span>
                      </div>
                    )}
                    
                    {displayProfile.address && (
                      <div className="flex items-start justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                          <span className="text-sm font-medium text-gray-600">Address</span>
                        </div>
                        <span className="text-sm text-gray-900 text-right max-w-48">{displayProfile.address}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Member Since</span>
                      <span className="text-sm text-gray-900">
                        {new Date(displayProfile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-gray-600">Last Active</span>
                      <span className="text-sm text-gray-900">
                        {displayProfile.last_login 
                          ? new Date(displayProfile.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Top Skill Categories */}
                  {skillStats.topCategories.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Top Skill Areas</h4>
                      <div className="space-y-3">
                        {skillStats.topCategories.map(({ category, count }, index) => (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                index === 0 ? 'bg-blue-500' : 
                                index === 1 ? 'bg-green-500' : 'bg-purple-500'
                              }`}></div>
                              <span className="text-sm text-gray-900 capitalize font-medium">{category}</span>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {count} skill{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Badges Section - Redesigned */}
            {userBadges.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-orange-500" />
                    Recent Achievements
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {userBadges.slice(0, 4).map((badge) => (
                    <div key={badge.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow bg-gray-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{badge.name}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{badge.description}</p>
                          <div className="flex items-center mt-3 space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeRarityColor(badge.rarity)}`}>
                              {badge.rarity}
                            </span>
                            {badge.token_reward > 0 && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                +{badge.token_reward} tokens
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {badge.UserBadges?.[0]?.earned_date ? new Date(badge.UserBadges[0].earned_date).toLocaleDateString() : 'Recently earned'}
                      </div>
                    </div>
                  ))}
                </div>
                
                {userBadges.length > 4 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => navigate('/badges')}
                      className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 py-2 rounded-lg transition-colors"
                    >
                      View All Badges ({userBadges.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Skills Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <UserSkillManagement
                userId={user.id}
                isOwnProfile={true}
                onSkillsChange={handleSkillsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;