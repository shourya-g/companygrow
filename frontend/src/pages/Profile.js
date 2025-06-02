import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchSkills, fetchCourses, fetchBadges, fetchSkills as fetchAllSkills, addUserSkillToUser, deleteUserSkillForUser, fetchUserSkills } from '../services/api';
import { useNavigate } from 'react-router-dom';
import SkillTag from '../components/SkillTag';

const Profile = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({ experience: '', name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [allSkills, setAllSkills] = useState([]); // For add-skill dropdown
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [addSkillError, setAddSkillError] = useState(null);
  const [skillSearch, setSkillSearch] = useState("");
  const filteredSkills = allSkills.filter(s =>
    !skills.some(us => us.id === s.id) &&
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  useEffect(() => {
    loadProfile();
    // Fetch all skills for the dropdown (not just user skills)
    fetchAllSkills().then(res => setAllSkills(res.data.data || []));
  }, []);

  useEffect(() => {
    if (user) {
      setEditProfile({
        experience: user.experience || '',
        name: user.name || user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the user's actual skills from the user-centric endpoint
      let userSkills = [];
      if (user && user.id) {
        userSkills = await fetchUserSkills(user.id);
      }
      setSkills(userSkills);
      const coursesRes = await fetchCourses();
      setCourses(coursesRes.data.data || []);
      const badgesRes = await fetchBadges();
      setBadges(badgesRes.data.data || []);
    } catch (err) {
      setError('Failed to load profile');
    }
    setLoading(false);
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
    setEditProfile({
      experience: user.experience || '',
      name: user.name || user.username || '',
      email: user.email || ''
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // PATCH/PUT to /api/users/:id (implement in backend if not present)
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(editProfile)
      });
      setEditing(false);
      // Optionally, reload user info from backend
      window.location.reload();
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  // Remove skill from user
  const handleRemoveSkill = async (skill) => {
    if (!window.confirm(`Remove skill '${skill.name}'?`)) return;
    try {
      await deleteUserSkillForUser(user.id, skill.id);
      setSkills(skills.filter(s => s.id !== skill.id));
      setShowAddSkill(false); // Hide add-skill dropdown if open
    } catch (err) {
      alert('Failed to remove skill');
    }
  };

  // Add skill to user
  const handleAddSkill = async (skill) => {
    setAddingSkill(true);
    setAddSkillError(null);
    try {
      await addUserSkillToUser(user.id, { user_id: user.id, skill_id: skill.id });
      setSkills([...skills, skill]);
      setShowAddSkill(false);
    } catch (err) {
      setAddSkillError('Failed to add skill');
    }
    setAddingSkill(false);
  };

  const courseProgress = courses.length ? Math.round((courses.filter(c => c.completed).length / courses.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Your skills, experience, and training progress</p>
        </div>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-4">
            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-gray-700">Name</label>
                  <input name="name" value={editProfile.name} onChange={handleEditChange} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-gray-700">Email</label>
                  <input name="email" value={editProfile.email} onChange={handleEditChange} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-gray-700">Experience</label>
                  <input name="experience" value={editProfile.experience} onChange={handleEditChange} className="border rounded px-3 py-2 w-full" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={handleCancelEdit}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="font-semibold text-lg">{user.name || user.username || user.email}</div>
                <div className="text-gray-600">{user.email}</div>
                <div className="text-gray-500">Experience: {user.experience || 'N/A'}</div>
                <button onClick={handleEditProfile} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>
              </>
            )}
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2 items-center">
              {skills.map(skill => (
                <SkillTag key={skill.id} skill={skill} removable={editing} onRemove={handleRemoveSkill} />
              ))}
              {editing && (
                <>
                  <button
                    type="button"
                    className="flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm border border-blue-200 hover:bg-blue-100 transition mr-2 mb-2"
                    onClick={() => setShowAddSkill(v => !v)}
                  >
                    <span className="mr-1">+ Add Skill</span>
                  </button>
                  {showAddSkill && (
                    <div className="absolute z-10 bg-white border border-gray-200 rounded shadow p-3 mt-2">
                      <div className="mb-2 font-semibold text-gray-700 text-sm">Add a skill</div>
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full mb-2"
                        placeholder="Search skills..."
                        value={skillSearch}
                        onChange={e => setSkillSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="max-h-40 overflow-y-auto">
                        {filteredSkills.length === 0 ? (
                          <div className="text-gray-400 px-2 py-1">No skills found</div>
                        ) : (
                          filteredSkills.map(skill => (
                            <div key={skill.id} className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded flex items-center"
                              onClick={() => handleAddSkill(skill)}>
                              <span>{skill.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                      {addSkillError && <div className="text-red-500 text-xs mt-2">{addSkillError}</div>}
                      {addingSkill && <div className="text-xs text-gray-500 mt-2">Adding...</div>}
                      <button className="mt-2 text-xs text-gray-500 hover:text-gray-700" onClick={() => setShowAddSkill(false)}>Cancel</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Training Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: `${courseProgress}%` }}></div>
            </div>
            <div className="text-sm text-gray-600">{courseProgress}% of courses completed</div>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Badges</h2>
            <ul className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <li key={badge.id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{badge.name}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>No user found.</div>
      )}
    </div>
  );
};

export default Profile;
