import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { usersAPI, handleApiError, skillUtils } from '../services/api';
import { useNavigate } from 'react-router-dom';
import UserSkillManagement from '../components/UserSkillManagement';
import { 
  User, Mail, Calendar, MapPin, Briefcase, 
  TrendingUp, Award, BookOpen, LogOut, Edit,
  CheckCircle, Clock, Star
} from 'lucide-react';

const Profile = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
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
  }, [user]);

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
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      
      // Fallback to basic user data
      setUserProfile(user);
      setUserSkills([]);
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

  const calculateSkillStats = () => {
    if (!userSkills || userSkills.length === 0) {
      return {
        totalSkills: 0,
        verifiedSkills: 0,
        averageProficiency: 0,
        portfolioScore: 0,
        topCategories: []
      };
    }

    const verifiedSkills = userSkills.filter(skill => skill.is_verified).length;
    const averageProficiency = userSkills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / userSkills.length;
    const portfolioScore = skillUtils.calculatePortfolioScore(userSkills);
    
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

    return {
      totalSkills: userSkills.length,
      verifiedSkills,
      averageProficiency: Math.round(averageProficiency * 10) / 10,
      portfolioScore,
      topCategories
    };
  };

  const skillStats = calculateSkillStats();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No User Found</h1>
          <p className="text-gray-600 mb-4">Please login to view your profile.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const displayProfile = userProfile || user;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {displayProfile.first_name && displayProfile.last_name 
                  ? `${displayProfile.first_name} ${displayProfile.last_name}` 
                  : displayProfile.name || displayProfile.email}
              </h1>
              <div className="flex items-center text-gray-600 mt-1">
                <Mail className="w-4 h-4 mr-2" />
                <span>{displayProfile.email}</span>
              </div>
              {displayProfile.position && displayProfile.department && (
                <div className="flex items-center text-gray-600 mt-1">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{displayProfile.position} • {displayProfile.department}</span>
                </div>
              )}
              {displayProfile.hire_date && (
                <div className="flex items-center text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {new Date(displayProfile.hire_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleEditProfile}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Skills Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Skills</p>
              <p className="text-2xl font-bold text-gray-900">{skillStats.totalSkills}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{skillStats.verifiedSkills}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Proficiency</p>
              <p className="text-2xl font-bold text-gray-900">{skillStats.averageProficiency}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Portfolio Score</p>
              <p className="text-2xl font-bold text-gray-900">{skillStats.portfolioScore}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Role</label>
                    <p className="text-gray-900 capitalize">{displayProfile.role}</p>
                  </div>
                  
                  {displayProfile.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{displayProfile.phone}</p>
                    </div>
                  )}
                  
                  {displayProfile.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">{displayProfile.address}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Member Since</label>
                    <p className="text-gray-900">
                      {new Date(displayProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Login</label>
                    <p className="text-gray-900">
                      {displayProfile.last_login 
                        ? new Date(displayProfile.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>

                {/* Top Skill Categories */}
                {skillStats.topCategories.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Top Skill Categories</h4>
                    <div className="space-y-2">
                      {skillStats.topCategories.map(({ category, count }) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-900 capitalize">{category}</span>
                          <span className="text-sm text-gray-600">{count} skill{count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Skills Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <UserSkillManagement
              userId={user.id}
              isOwnProfile={true}
              onSkillsChange={handleSkillsChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;