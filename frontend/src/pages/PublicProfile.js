import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  User, Mail, Calendar, Briefcase, 
  TrendingUp, Award, BookOpen,
  CheckCircle, Search, ArrowLeft, Users
} from 'lucide-react';
import { usersAPI, badgesAPI, userSkillsAPI, courseEnrollmentAPI } from '../services/api';

const PublicProfile = () => {
  const { userId } = useParams();
  const authUser = useSelector(state => state.auth.user);
  
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [skills, setSkills] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(!userId);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      setShowUserSearch(false);
    } else {
      setShowUserSearch(true);
      loadAllUsers();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load user profile
      const userRes = await usersAPI.getById(userId);
      setProfile(userRes.data.data);

      // Load user badges (only if viewing own profile or user has admin/manager role)
      const currentUserId = authUser?.id;
      const isOwnProfile = currentUserId && parseInt(userId) === currentUserId;
      const isAdminOrManager = authUser?.role && ['admin', 'manager'].includes(authUser.role);
      
      if (isOwnProfile || isAdminOrManager) {
      try {
        const badgesRes = await badgesAPI.getUserBadges(userId);
        setBadges(badgesRes.data.data || []);
      } catch (badgeError) {
        console.warn('Could not load user badges:', badgeError);
          setBadges([]);
        }
      } else {
        // For other users' profiles, we can't see their badges due to privacy
        setBadges([]);
      }

      // Load user skills (only if viewing own profile or user has admin/manager role)
      if (isOwnProfile || isAdminOrManager) {
      try {
          const skillsRes = await usersAPI.getSkills(userId);
        setSkills(skillsRes.data.data || []);
      } catch (skillError) {
        console.warn('Could not load user skills:', skillError);
          setSkills([]);
        }
      } else {
        // For other users' profiles, we can't see their detailed skills due to privacy
        setSkills([]);
      }

      // Load user course completions (only if viewing own profile or user has admin/manager role)
      if (isOwnProfile || isAdminOrManager) {
      try {
        const enrollmentsRes = await courseEnrollmentAPI.getUserEnrollments(userId);
        const completedCourses = enrollmentsRes.data.data?.filter(e => e.status === 'completed') || [];
        setEnrollments(completedCourses);
      } catch (enrollError) {
        console.warn('Could not load user enrollments:', enrollError);
          setEnrollments([]);
        }
      } else {
        // For other users' profiles, we can't see their course enrollments due to privacy
        setEnrollments([]);
      }

    } catch (err) {
      setError('Failed to load user profile');
    }
    setLoading(false);
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.browse();
      setSearchUsers(response.data.data || []);
    } catch (err) {
      setError('Failed to load users');
    }
    setLoading(false);
  };

  const getBadgeRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = searchUsers.filter(user => 
    user.id !== authUser?.id && // Don't show current user
    ((user.first_name + ' ' + user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showUserSearch) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3" />
            Browse Employee Profiles
          </h1>
          <p className="text-gray-600 mt-2">
            Discover your colleagues' skills, achievements, and expertise
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl font-bold">
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{user.position}</p>
                  <p className="text-gray-500 text-sm mb-4">{user.department}</p>
                  
                  <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </span>
                    <span className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      View Profile
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
        <p className="text-gray-600 mb-4">{error || 'The user profile you are looking for does not exist.'}</p>
        <Link 
          to="/profile"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to My Profile
        </Link>
      </div>
    );
  }

  const earnedBadges = badges.filter(b => b.UserBadge);
  // Privacy checks
  const currentUserId = authUser?.id;
  const isOwnProfile = currentUserId && parseInt(userId) === currentUserId;
  const isAdminOrManager = authUser?.role && ['admin', 'manager'].includes(authUser.role);
  
  const badgeStats = {
    total: earnedBadges.length,
    common: earnedBadges.filter(b => b.rarity === 'common').length,
    uncommon: earnedBadges.filter(b => b.rarity === 'uncommon').length,
    rare: earnedBadges.filter(b => b.rarity === 'rare').length,
    epic: earnedBadges.filter(b => b.rarity === 'epic').length,
    legendary: earnedBadges.filter(b => b.rarity === 'legendary').length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="mb-8">
        <Link
          to="/profile"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to My Profile
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
          <Link
            to="/profile/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Browse All Profiles
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <div className="flex items-center space-x-6 mt-2 text-gray-600">
              <span className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                {profile.position || 'No position specified'}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {profile.department || 'No department specified'}
              </span>
              {profile.hire_date && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(profile.hire_date).toLocaleDateString()}
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-gray-700 mt-3">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2" />
            Badges & Achievements {(isOwnProfile || isAdminOrManager) ? `(${badgeStats.total})` : ''}
          </h3>
          
          {/* Badge Stats - Only show for own profile or admin/manager */}
          {(isOwnProfile || isAdminOrManager) && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-600">{badgeStats.common}</div>
              <div className="text-xs text-gray-500">Common</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{badgeStats.uncommon}</div>
              <div className="text-xs text-green-500">Uncommon</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">{badgeStats.rare}</div>
              <div className="text-xs text-blue-500">Rare</div>
            </div>
          </div>
          )}

          {!isOwnProfile && !isAdminOrManager ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Badge information is private</p>
              <p className="text-xs text-gray-400 mt-1">Only visible to the user and administrators</p>
            </div>
          ) : earnedBadges.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {earnedBadges.map(badge => (
                <div 
                  key={badge.id} 
                  className={`p-3 rounded-lg border ${getBadgeRarityColor(badge.rarity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm opacity-80 mt-1">{badge.description}</p>
                      {badge.UserBadge?.earned_date && (
                        <p className="text-xs opacity-60 mt-1">
                          Earned: {new Date(badge.UserBadge.earned_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide ml-2">
                      {badge.rarity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No badges earned yet</p>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Skills & Expertise {(isOwnProfile || isAdminOrManager) ? `(${skills.length})` : ''}
          </h3>
          
          {!isOwnProfile && !isAdminOrManager ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Skills information is private</p>
              <p className="text-xs text-gray-400 mt-1">Only visible to the user and administrators</p>
            </div>
          ) : skills.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {skills.map(userSkill => (
                <div key={userSkill.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{userSkill.Skill?.name}</h4>
                      <p className="text-sm text-gray-600">{userSkill.Skill?.category}</p>
                      {userSkill.years_experience && !isNaN(userSkill.years_experience) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(userSkill.years_experience)} years experience
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getProficiencyColor(userSkill.proficiency_level)}`}>
                        {userSkill.proficiency_level}
                      </span>
                      {userSkill.is_verified && (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No skills listed yet</p>
            </div>
          )}
        </div>

        {/* Course Completions */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Completed Courses {(isOwnProfile || isAdminOrManager) ? `(${enrollments.length})` : ''}
          </h3>
          
          {!isOwnProfile && !isAdminOrManager ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Course completion information is private</p>
              <p className="text-xs text-gray-400 mt-1">Only visible to the user and administrators</p>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{enrollment.Course?.title}</h4>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{enrollment.Course?.category}</p>
                  {enrollment.completion_date && (
                    <p className="text-xs text-gray-500">
                      Completed: {new Date(enrollment.completion_date).toLocaleDateString()}
                    </p>
                  )}
                  {enrollment.final_score && !isNaN(enrollment.final_score) && (
                    <p className="text-xs text-green-600 font-medium">
                      Score: {Math.round(enrollment.final_score)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No completed courses yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;