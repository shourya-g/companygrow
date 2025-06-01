import React, { useEffect, useState } from 'react';
import { fetchSkills, createSkill, deleteSkill } from '../services/api';
import { useSelector } from 'react-redux';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkill, setNewSkill] = useState({ name: '', description: '' });
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
      let filtered = Array.isArray(res.data.data) ? res.data.data : [];
      if (authUser && authUser.id) {
        filtered = filtered.filter(s => s.user_id === authUser.id);
      }
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
      await createSkill({ ...newSkill, user_id: authUser?.id });
      setNewSkill({ name: '', description: '' });
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
        <p className="text-gray-600 mt-2">Browse and manage skills below.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700">Name</label>
            <input name="name" value={newSkill.name} onChange={handleInputChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Description</label>
            <input name="description" value={newSkill.description} onChange={handleInputChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={creating}>
            {creating ? 'Creating...' : 'Add Skill'}
          </button>
        </form>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {skills.length === 0 ? (
            <p className="text-gray-500">No skills found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {skills.map(skill => (
                <li key={skill.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{skill.name}</div>
                    <div className="text-gray-600">{skill.description}</div>
                  </div>
                  <button onClick={() => handleDelete(skill.id)} className="text-red-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Skills;
