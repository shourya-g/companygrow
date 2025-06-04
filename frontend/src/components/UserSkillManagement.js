import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Star, Award, Calendar, 
  CheckCircle, XCircle, Edit3, Trash2,
  TrendingUp, Clock, Users
} from 'lucide-react';
import { skillsAPI, usersAPI, handleApiError } from '../services/api';
import { useSelector } from 'react-redux';

const UserSkillManagement = ({ userId, isOwnProfile = false, onSkillsChange }) => {
  const [userSkills, setUserSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authUser = useSelector(state => state.auth.user);
  const isAdmin = authUser?.role === 'admin';
  const canEdit = isOwnProfile || isAdmin;
  const canVerify = isAdmin;

  const [newUserSkill, setNewUserSkill] = useState({
    skill_id: '',
    proficiency_level: 1,
    years_experience: 0
  });

  const [editUserSkill, setEditUserSkill] = useState({
    proficiency_level: 1,
    years_experience: 0,
    is_verified: false
  });

  useEffect(() => {
    loadUserSkills();
    loadAvailableSkills();
  }, [userId]);

  const loadUserSkills = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getSkills(userId);
      setUserSkills(response.data.data || []);
      if (onSkillsChange) {
        onSkillsChange(response.data.data || []);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      setUserSkills([]);
    }
    setLoading(false);
  };

  const loadAvailableSkills = async () => {
    try {
      const response = await skillsAPI.getAll({ limit: 1000 });
      setAvailableSkills(response.data.data || []);
    } catch (err) {
      console.error('Failed to load available skills:', err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      await usersAPI.addSkill(userId, newUserSkill);
      setShowAddModal(false);
      setNewUserSkill({ skill_id: '', proficiency_level: 1, years_experience: 0 });
      loadUserSkills();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    setAdding(false);
  };

  const handleEditSkill = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      await usersAPI.updateSkill(userId, selectedSkill.id, editUserSkill);
      setShowEditModal(false);
      setSelectedSkill(null);
      loadUserSkills();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    setUpdating(false);
  };

  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Remove "${skill.name}" from your skills?`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await usersAPI.deleteSkill(userId, skill.id);
      loadUserSkills();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    setDeleting(false);
  };

  const handleVerifySkill = async (skill, verified) => {
    try {
      await usersAPI.updateSkill(userId, skill.id, { is_verified: verified });
      loadUserSkills();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
  };

  const openEditModal = (userSkill) => {
    setSelectedSkill(userSkill);
    setEditUserSkill({
      proficiency_level: userSkill.proficiency_level,
      years_experience: userSkill.years_experience,
      is_verified: userSkill.is_verified
    });
    setShowEditModal(true);
  };

  const getAvailableSkillsForAdd = () => {
    const userSkillIds = userSkills.map(us => us.id);
    return availableSkills.filter(skill => !userSkillIds.includes(skill.id));
  };

  const filteredUserSkills = userSkills.filter(skill => {
    const matchesSearch = !searchTerm || 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || skill.category === filterCategory;
    
    const matchesVerified = filterVerified === 'all' || 
      (filterVerified === 'verified' && skill.is_verified) ||
      (filterVerified === 'unverified' && !skill.is_verified);

    return matchesSearch && matchesCategory && matchesVerified;
  });

  const getProficiencyLabel = (level) => {
    const labels = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  };

  const getProficiencyColor = (level) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-green-100 text-green-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      soft: 'bg-green-100 text-green-800',
      leadership: 'bg-purple-100 text-purple-800',
      business: 'bg-orange-100 text-orange-800',
      creative: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const skillCategories = [...new Set(userSkills.map(skill => skill.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
          <p className="text-sm text-gray-600">
            {isOwnProfile ? 'Manage your skills and proficiency levels' : 'User skills and competencies'}
          </p>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {skillCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Skills</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Skills List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUserSkills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {userSkills.length === 0 ? 
            'No skills added yet' : 
            'No skills match your filters'
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUserSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{skill.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(skill.category)}`}>
                      {skill.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProficiencyColor(skill.proficiency_level)}`}>
                      {getProficiencyLabel(skill.proficiency_level)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {skill.is_verified ? (
                    <CheckCircle className="w-5 h-5 text-green-500" title="Verified skill" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" title="Unverified skill" />
                  )}
                  
                  {canEdit && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(skill)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit skill"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill)}
                        disabled={deleting}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                        title="Remove skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {/* Proficiency Stars */}
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">Proficiency:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(level => (
                      <Star
                        key={level}
                        className={`w-4 h-4 ${
                          level <= skill.proficiency_level 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {skill.years_experience === 0 
                      ? 'No experience specified'
                      : `${skill.years_experience} year${skill.years_experience !== 1 ? 's' : ''} experience`
                    }
                  </span>
                </div>

                {/* Added date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Added {new Date(skill.added_at).toLocaleDateString()}</span>
                </div>

                {/* Admin verification controls */}
                {canVerify && !skill.is_verified && (
                  <button
                    onClick={() => handleVerifySkill(skill, true)}
                    className="text-sm text-green-600 hover:text-green-800 transition-colors"
                  >
                    ✓ Verify this skill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Skill</h3>
            </div>
            
            <form onSubmit={handleAddSkill} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill *
                  </label>
                  <select
                    value={newUserSkill.skill_id}
                    onChange={(e) => setNewUserSkill({ ...newUserSkill, skill_id: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a skill...</option>
                    {getAvailableSkillsForAdd().map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} ({skill.category})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proficiency Level *
                  </label>
                  <select
                    value={newUserSkill.proficiency_level}
                    onChange={(e) => setNewUserSkill({ ...newUserSkill, proficiency_level: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Basic</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Expert</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newUserSkill.years_experience}
                    onChange={(e) => setNewUserSkill({ ...newUserSkill, years_experience: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUserSkill({ skill_id: '', proficiency_level: 1, years_experience: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {adding ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {showEditModal && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit: {selectedSkill.name}
              </h3>
            </div>
            
            <form onSubmit={handleEditSkill} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proficiency Level *
                  </label>
                  <select
                    value={editUserSkill.proficiency_level}
                    onChange={(e) => setEditUserSkill({ ...editUserSkill, proficiency_level: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Basic</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Expert</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editUserSkill.years_experience}
                    onChange={(e) => setEditUserSkill({ ...editUserSkill, years_experience: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {canVerify && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={editUserSkill.is_verified}
                      onChange={(e) => setEditUserSkill({ ...editUserSkill, is_verified: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="verified" className="ml-2 block text-sm text-gray-900">
                      Verified skill
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSkill(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSkillManagement;