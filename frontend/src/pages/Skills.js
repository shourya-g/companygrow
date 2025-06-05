import React, { useEffect, useState } from 'react';
import { fetchSkills, createSkill, deleteSkill } from '../services/api';
import { useSelector } from 'react-redux';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkill, setNewSkill] = useState({ name: '', description: '', category: 'technical' });
  const [creating, setCreating] = useState(false);
  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    loadSkills();
  }, [authUser]);

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSkills();
      // Show ALL skills - skills are global, not user-specific
      let filtered = Array.isArray(res.data.data) ? res.data.data : [];
      
      // Remove user-specific filtering for skills
      // Skills should be available to all users
      setSkills(filtered);
    } catch (err) {
      setError('Failed to load skills');
      setSkills([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setNewSkill({ ...newSkill, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createSkill(newSkill);
      setNewSkill({ name: '', description: '', category: 'technical' });
      loadSkills();
    } catch (err) {
      setError('Failed to create skill');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    setError(null);
    try {
      await deleteSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      setError('Failed to delete skill');
    }
  };

  // Only admins can create/delete skills
  const canManageSkills = authUser && authUser.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
        <p className="text-gray-600 mt-2">Browse available skills in the platform.</p>
      </div>

      {/* Only show skill creation form to admins */}
      {canManageSkills && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Add New Skill</h2>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-gray-700">Name</label>
              <input 
                name="name" 
                value={newSkill.name} 
                onChange={handleInputChange} 
                required 
                className="border rounded px-3 py-2 w-full" 
                placeholder="e.g., JavaScript, Leadership"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">Category</label>
              <select 
                name="category" 
                value={newSkill.category} 
                onChange={handleInputChange} 
                className="border rounded px-3 py-2 w-full"
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skills</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">Description</label>
              <input 
                name="description" 
                value={newSkill.description} 
                onChange={handleInputChange} 
                className="border rounded px-3 py-2 w-full" 
                placeholder="Brief description"
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors" 
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Add Skill'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="text-red-600 mb-4 bg-red-50 p-3 rounded">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {skills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No skills available yet.</p>
              {canManageSkills && (
                <p className="text-gray-400">Add the first skill using the form above.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map(skill => (
                <div key={skill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{skill.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                      skill.category === 'soft' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {skill.category}
                    </span>
                  </div>
                  
                  {skill.description && (
                    <p className="text-gray-600 text-sm mb-3">{skill.description}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                      Add to Profile
                    </button>
                    
                    {canManageSkills && (
                      <button 
                        onClick={() => handleDelete(skill.id)} 
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Skills;