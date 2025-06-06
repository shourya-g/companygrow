import React, { useEffect, useState, useCallback } from 'react';
import { fetchProjects, createProject, deleteProject, skillsAPI, projectSkillsAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { X, Plus, AlertCircle, Search } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium',
    status: 'planning',
    start_date: '',
    end_date: '',
    estimated_hours: '',
    budget: '',
    client_name: ''
  });
  const [creating, setCreating] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillLoading, setSkillLoading] = useState(false);
  const authUser = useSelector(state => state.auth.user);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProjects();
      let filtered = Array.isArray(res.data.data) ? res.data.data : [];
      if (authUser && authUser.id) {
        filtered = filtered.filter(p => p.created_by === authUser.id || p.project_manager_id === authUser.id);
      }
      setProjects(filtered);
    } catch (err) {
      setError('Failed to load projects');
      setProjects([]);
    }
    setLoading(false);
  }, [authUser]);

  const loadSkills = useCallback(async () => {
    setSkillLoading(true);
    try {
      const res = await skillsAPI.getAll();
      setAvailableSkills(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load skills:', err);
      setAvailableSkills([]);
    }
    setSkillLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
    loadSkills();
  }, [authUser, loadProjects, loadSkills]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleSkillAdd = (skill) => {
    const isAlreadySelected = selectedSkills.some(s => s.id === skill.id);
    if (!isAlreadySelected) {
      setSelectedSkills([...selectedSkills, {
        ...skill,
        required_level: 3,
        is_mandatory: true
      }]);
    }
    setSkillSearch('');
  };

  const handleSkillRemove = (skillId) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
  };

  const handleSkillUpdate = (skillId, field, value) => {
    setSelectedSkills(selectedSkills.map(skill => 
      skill.id === skillId ? { ...skill, [field]: value } : skill
    ));
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.some(s => s.id === skill.id)
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    
    try {
      // Create the project first
      const projectData = {
        ...newProject,
        created_by: authUser?.id,
        project_manager_id: authUser?.id
      };
      
      const createdProject = await createProject(projectData);
      
      // If skills are selected, add them to the project
      if (selectedSkills.length > 0) {
        try {
          // Add project skills
          for (const skill of selectedSkills) {
            await projectSkillsAPI.addSkillToProject({
              project_id: createdProject.data.data.id,
              skill_id: skill.id,
              required_level: skill.required_level,
              is_mandatory: skill.is_mandatory
            });
          }
        } catch (skillErr) {
          console.warn('Failed to add skills to project:', skillErr);
          // Don't fail the whole operation if skills fail
        }
      }
      
      // Reset form
      setNewProject({
        name: '',
        description: '',
        priority: 'medium',
        status: 'planning',
        start_date: '',
        end_date: '',
        estimated_hours: '',
        budget: '',
        client_name: ''
      });
      setSelectedSkills([]);
      
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-2">Create and manage projects with skill requirements and priorities.</p>
      </div>

      {/* Create Project Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h2>
        <form onSubmit={handleCreate} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                name="name"
                value={newProject.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                name="client_name"
                value={newProject.client_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Client or department name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the project goals and requirements"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                name="priority"
                value={newProject.priority}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={newProject.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Dates and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={newProject.start_date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={newProject.end_date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
              <input
                type="number"
                name="estimated_hours"
                value={newProject.estimated_hours}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Total hours"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={newProject.budget}
                onChange={handleInputChange}
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Project budget"
              />
            </div>
          </div>

          {/* Required Skills Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Required Skills</label>
              <button
                type="button"
                onClick={() => setShowSkillSelector(!showSkillSelector)}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skills
              </button>
            </div>

            {/* Selected Skills Display */}
            {selectedSkills.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Skills:</h4>
                <div className="space-y-2">
                  {selectedSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <span className="ml-2 text-sm text-gray-500">({skill.category})</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Level:</label>
                          <select
                            value={skill.required_level}
                            onChange={(e) => handleSkillUpdate(skill.id, 'required_level', parseInt(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value={1}>1 - Beginner</option>
                            <option value={2}>2 - Basic</option>
                            <option value={3}>3 - Intermediate</option>
                            <option value={4}>4 - Advanced</option>
                            <option value={5}>5 - Expert</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={skill.is_mandatory}
                              onChange={(e) => handleSkillUpdate(skill.id, 'is_mandatory', e.target.checked)}
                              className="mr-1"
                            />
                            Required
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Selector */}
            {showSkillSelector && (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {skillLoading ? (
                  <div className="text-center py-4">Loading skills...</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredSkills.length === 0 ? (
                      <div className="text-gray-500 text-center py-4">
                        {skillSearch ? 'No skills found matching your search' : 'No more skills available'}
                      </div>
                    ) : (
                      filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillAdd(skill)}
                          className="w-full text-left p-2 hover:bg-white rounded flex items-center justify-between group"
                        >
                          <div>
                            <span className="font-medium text-gray-900">{skill.name}</span>
                            <span className="ml-2 text-sm text-gray-500">({skill.category})</span>
                          </div>
                          <Plus className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <div className="text-red-600">{error}</div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>

      {/* Projects List */}
      {error && !creating && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found. Create your first project above!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {projects.map(project => (
                <div key={project.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-600 mb-3">{project.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        {project.client_name && (
                          <div>
                            <span className="font-medium">Client:</span> {project.client_name}
                          </div>
                        )}
                        {project.estimated_hours && (
                          <div>
                            <span className="font-medium">Hours:</span> {project.estimated_hours}
                          </div>
                        )}
                        {project.budget && (
                          <div>
                            <span className="font-medium">Budget:</span> ${project.budget}
                          </div>
                        )}
                        {project.start_date && (
                          <div>
                            <span className="font-medium">Start:</span> {new Date(project.start_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Delete
                    </button>
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

export default Projects;