import React, { useEffect, useState } from 'react';
import { fetchProjects, createProject, deleteProject } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProjects();
      // Ensure projects is always an array
      setProjects(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError('Failed to load projects');
      setProjects([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createProject(newProject);
      setNewProject({ name: '', description: '' });
      loadProjects();
    } catch (err) {
      setError('Failed to create project');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setError(null);
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-2">Manage your projects below.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700">Name</label>
            <input name="name" value={newProject.name} onChange={handleInputChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Description</label>
            <input name="description" value={newProject.description} onChange={handleInputChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={creating}>
            {creating ? 'Creating...' : 'Add Project'}
          </button>
        </form>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map(project => (
                <li key={project.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{project.name}</div>
                    <div className="text-gray-600">{project.description}</div>
                  </div>
                  <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
