import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchProjects, fetchSkills } from '../services/api';

const ProjectAssignments = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRes = await fetchUsers();
      setUsers(usersRes.data.data || []);
      const projectsRes = await fetchProjects();
      setProjects(projectsRes.data.data || []);
      const skillsRes = await fetchSkills();
      setSkills(skillsRes.data.data || []);
    } catch (err) {
      setError('Failed to load data');
    }
    setLoading(false);
  };

  // Dummy skill match for demo
  const getSkillMatch = (user) => {
    // In a real app, compare user.skills to project.skills
    return Math.floor(Math.random() * 100);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    // TODO: Implement backend assignment logic
    alert(`Assigned user ${selectedUser} to project ${selectedProject}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Assignment</h1>
        <p className="text-gray-600 mt-2">Assign users to projects based on skill match</p>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-gray-700">Project</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="border rounded px-3 py-2 w-full" required>
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">User</label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="border rounded px-3 py-2 w-full" required>
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name || user.username || user.email}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Assign</button>
          </form>
          <h2 className="font-semibold text-md mb-2">Recommended Users for Each Project</h2>
          <ul className="divide-y divide-gray-200">
            {projects.map(project => (
              <li key={project.id} className="py-4">
                <div className="font-semibold text-lg">{project.name}</div>
                <div className="text-gray-600 mb-2">{project.description}</div>
                <div className="text-sm text-gray-500 mb-1">Recommended users (by skill match):</div>
                <ul className="flex flex-wrap gap-2">
                  {users.slice(0, 3).map(user => (
                    <li key={user.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {user.name || user.username || user.email} ({getSkillMatch(user)}% match)
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectAssignments;
