import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchSkills, fetchCourses, fetchBadges, usersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import SkillTag from '../components/SkillTag';

const Profile = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]); // Initialize as empty array
  const [courses, setCourses] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({ 
    experience: '', 
    name: '', 
    email: '',
    first_name: '',
    last_name: '',
    department: '',
    position: ''
  });
  const [saving, setSaving] = useState(false);
  const [allSkills, setAllSkills] = useState([]); // Initialize as empty array
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [addSkillError, setAddSkillError] = useState(null);
  const [skillSearch, setSkillSearch] = useState("");

  // Ensure skills and allSkills are arrays before filtering
  const filteredSkills = Array.isArray(allSkills) && Array.isArray(skills) 
    ? allSkills.filter(s =>
        !skills.some(us => us.id === s.id) &&
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (user && user.id) {
      loadProfile();
      loadAllSkills();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditProfile({
        experience: user.experience || '',
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch the user's skills
      const userSkillsResponse = await usersAPI.getSkills(user.id);
      const userSkills = Array.isArray(userSkillsResponse.data.data) ? userSkillsResponse.data.data : [];
      setSkills(userSkills);

      // Fetch courses
      const coursesRes = await fetchCourses();
      const coursesData = Array.isArray(coursesRes.data.data) ? coursesRes.data.data : [];
      setCourses(coursesData);

      // Fetch badges
      const badgesRes = await fetchBadges();
      const badgesData = Array.isArray(badgesRes.data.data) ? badgesRes.data.data : [];
      setBadges(badgesData);
    } catch (err) {
      console.error('Load profile error:', err);
      setError('Failed to load profile');
      // Set defaults to prevent errors
      setSkills([]);
      setCourses([]);
      setBadges([]);
    }
    setLoading(false);
  };

  const loadAllSkills = async () => {
    try {
      const skillsRes = await fetchSkills();
      const skillsData = Array.isArray(skillsRes.data.data) ? skillsRes.data.data : [];
      setAllSkills(skillsData);
    } catch (err) {
      console.error('Load all skills error:', err);
      setAllSkills([]);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleEditChange = (e) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (user) {
      setEditProfile({
        experience: user.experience || '',
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updateData = {
        first_name: editProfile.first_name,
        last_name: editProfile.last_name,
        email: editProfile.email,
        department: editProfile.department,
        position: editProfile.position
      };

      await usersAPI.update(user.id, updateData);
      setEditing(false);
      
      // Reload user data
      window.location.reload();
    } catch (err) {
      console.error('Save profile error:', err);
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  // Remove skill from user
  const handleRemoveSkill = async (skill) => {
    if (!window.confirm(`Remove skill '${skill.name}'?`)) return;
    try {
      await usersAPI.deleteSkill(user.id, skill.id);
      setSkills(prevSkills => Array.isArray(prevSkills) ? prevSkills.filter(s => s.id !== skill.id) : []);
      setShowAddSkill(false);
    } catch (err) {
      console.error('Remove skill error:', err);
      alert('Failed to remove skill');
    }
  };

  // Add skill to user
  const handleAddSkill = async (skill) => {
    setAddingSkill(true);
    setAddSkillError(null);
    try {
      const skillData = {
        skill_id: skill.id,
        proficiency_level: 1,
        years_experience: 0
      };
      
      await usersAPI.addSkill(user.id, skillData);
      
      // Add skill to local state
      const newSkill = {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        proficiency_level: 1,
        years_experience: 0,
        is_verified: false
      };
      
      setSkills(prevSkills => Array.isArray(prevSkills) ? [...prevSkills, newSkill] : [newSkill]);
      setShowAddSkill(false);
      setSkillSearch("");
    } catch (err) {
      console.error('Add skill error:', err);
      setAddSkillError('Failed to add skill');
    }
    setAddingSkill(false);
  };

  const courseProgress = Array.isArray(courses) && courses.length > 0 
    ? Math.round((courses.filter(c => c.completed).length / courses.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No User Found</h1>
          <p className="text-gray-600 mb-4">Please login to view your profile.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Your skills, experience, and training progress</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4">
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input 
                    name="first_name" 
                    value={editProfile.first_name} 
                    onChange={handleEditChange} 
                    className="mt-1 border rounded px-3 py-2 w-full focus:ring-primary-500 focus:border-primary-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input 
                    name="last_name" 
                    value={editProfile.last_name} 
                    onChange={handleEditChange} 
                    className="mt-1 border rounded px-3 py-2 w-full focus:ring-primary-500 focus:border-primary-500" 
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  name="email" 
                  type="email"
                  value={editProfile.email} 
                  onChange={handleEditChange} 
                  className="mt-1 border rounded px-3 py-2 w-full focus:ring-primary-500 focus:border-primary-500" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input 
                    name="department" 
                    value={editProfile.department} 
                    onChange={handleEditChange} 
                    className="mt-1 border rounded px-3 py-2 w-full focus:ring-primary-500 focus:border-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input 
                    name="position" 
                    value={editProfile.position} 
                    onChange={handleEditChange} 
                    className="mt-1 border rounded px-3 py-2 w-full focus:ring-primary-500 focus:border-primary-500" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-2">
                <div className="font-semibold text-lg">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.name || user.username || user.email}
                </div>
                <div className="text-gray-600">{user.email}</div>
                {user.department && (
                  <div className="text-gray-500">Department: {user.department}</div>
                )}
                {user.position && (
                  <div className="text-gray-500">Position: {user.position}</div>
                )}
              </div>
              <button 
                onClick={handleEditProfile} 
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {Array.isArray(skills) && skills.map(skill => (
              <SkillTag 
                key={skill.id} 
                skill={skill} 
                removable={editing} 
                onRemove={handleRemoveSkill} 
              />
            ))}
            
            {editing && (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm border border-blue-200 hover:bg-blue-100 transition"
                  onClick={() => setShowAddSkill(!showAddSkill)}
                >
                  <span className="mr-1">+ Add Skill</span>
                </button>
                
                {showAddSkill && (
                  <div className="absolute z-10 bg-white border border-gray-200 rounded shadow-lg p-4 mt-2 w-64">
                    <div className="mb-2 font-semibold text-gray-700 text-sm">Add a skill</div>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full mb-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                      autoFocus
                    />
                    <div className="max-h-32 overflow-y-auto">
                      {filteredSkills.length === 0 ? (
                        <div className="text-gray-400 px-2 py-1 text-sm">
                          {skillSearch ? 'No skills found' : 'Type to search skills'}
                        </div>
                      ) : (
                        filteredSkills.map(skill => (
                          <div 
                            key={skill.id} 
                            className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-sm flex items-center justify-between"
                            onClick={() => handleAddSkill(skill)}
                          >
                            <span>{skill.name}</span>
                            <span className="text-xs text-gray-500">{skill.category}</span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {addSkillError && (
                      <div className="text-red-500 text-xs mt-2">{addSkillError}</div>
                    )}
                    {addingSkill && (
                      <div className="text-xs text-gray-500 mt-2">Adding...</div>
                    )}
                    
                    <button 
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700" 
                      onClick={() => {
                        setShowAddSkill(false);
                        setSkillSearch("");
                        setAddSkillError(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!Array.isArray(skills) || skills.length === 0 ? (
            <p className="text-gray-500 text-sm mt-2">No skills added yet.</p>
          ) : null}
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Training Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${courseProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            {courseProgress}% of courses completed ({Array.isArray(courses) ? courses.length : 0} total courses)
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Badges</h2>
          {Array.isArray(badges) && badges.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <li 
                  key={badge.id} 
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                >
                  {badge.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No badges earned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;