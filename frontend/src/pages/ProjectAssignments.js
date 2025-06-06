import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  projectAssignmentsAPI, 
  projectsAPI, 
  usersAPI 
} from '../services/api';
import SkillMatchIndicator from '../components/SkillMatchIndicator';
import WorkloadIndicator from '../components/WorkLoadIndicator';
import SkillGapAnalysis from '../components/SkillGapAnalysis';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  UserPlus, 
  BarChart3,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';

const ProjectAssignments = () => {
  const authUser = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({
    role: '',
    hours_allocated: '',
    hourly_rate: '',
    validate_skills: true
  });
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    qualification: 'all', // all, qualified, unqualified
    workload: 'all', // all, available, light, heavy
    minMatch: 0
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject && activeTab === 'recommendations') {
      loadRecommendations();
    }
  }, [selectedProject, activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load basic data first
      const [projectsRes, usersRes] = await Promise.all([
        projectsAPI.getAll(),
        usersAPI.getAll(),
      ]);
      
      setProjects(projectsRes.data.data || []);
      setUsers(usersRes.data.data || []);
      
      // Try to load assignments and statistics (may fail if backend not ready)
      try {
        const [assignmentsRes, statsRes] = await Promise.all([
          projectAssignmentsAPI.getAll(),
          projectAssignmentsAPI.getStatistics()
        ]);
        setAssignments(assignmentsRes.data.data || []);
        setStatistics(statsRes.data.data || null);
      } catch (err) {
        console.warn('Project assignments API not available:', err);
        setAssignments([]);
        setStatistics(null);
      }
      
      // Auto-select first project if available
      if (projectsRes.data.data && projectsRes.data.data.length > 0) {
        setSelectedProject(projectsRes.data.data[0].id.toString());
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load data');
    }
    setLoading(false);
  };

  const loadRecommendations = async () => {
    if (!selectedProject) return;
    
    try {
      const res = await projectAssignmentsAPI.getRecommendations(selectedProject);
      setRecommendations(res.data.data);
    } catch (err) {
      console.error('Load recommendations error:', err);
      // Create mock recommendations for testing
      setRecommendations({
        project: {
          id: selectedProject,
          name: projects.find(p => p.id.toString() === selectedProject)?.name || 'Selected Project',
          required_skills: []
        },
        recommendations: users.map((user, index) => ({
          user: {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            department: user.department || 'Unknown',
            position: user.position || 'Employee'
          },
          match_analysis: {
            overall_match: Math.max(0, 100 - (index * 10)),
            mandatory_match: Math.max(0, 100 - (index * 15)),
            optional_match: Math.max(0, 100 - (index * 5)),
            recommendation_score: Math.max(0, 100 - (index * 8)),
            is_qualified: index < 3
          },
          workload: {
            current_projects: index % 4,
            availability_score: Math.max(0, 100 - ((index % 4) * 25)),
            active_assignments: []
          },
          skill_details: {
            gaps: [],
            strengths: []
          }
        })),
        summary: {
          total_candidates: users.length,
          qualified_candidates: Math.min(3, users.length),
          avg_match_score: 75
        }
      });
    }
  };

  const handleAssignment = async (userId, projectId = selectedProject) => {
    if (!userId || !projectId) return;
    
    setAssignmentLoading(true);
    try {
      const assignmentData = {
        project_id: parseInt(projectId),
        user_id: userId,
        ...assignmentForm
      };
      
      await projectAssignmentsAPI.assignUser(assignmentData);
      
      // Refresh data
      await loadInitialData();
      if (activeTab === 'recommendations') {
        await loadRecommendations();
      }
      
      setAssignmentForm({
        role: '',
        hours_allocated: '',
        hourly_rate: '',
        validate_skills: true
      });
      
      alert('User successfully assigned to project!');
    } catch (err) {
      console.error('Assignment error:', err);
      alert('Failed to assign user: ' + (err.response?.data?.error?.message || err.message));
    }
    setAssignmentLoading(false);
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    
    try {
      await projectAssignmentsAPI.remove(assignmentId);
      await loadInitialData();
      alert('Assignment removed successfully!');
    } catch (err) {
      console.error('Remove assignment error:', err);
      alert('Failed to remove assignment');
    }
  };

  const filteredRecommendations = recommendations?.recommendations?.filter(rec => {
    const matchesSearch = !filters.search || 
      rec.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      rec.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      rec.user.department?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesQualification = filters.qualification === 'all' ||
      (filters.qualification === 'qualified' && rec.match_analysis.is_qualified) ||
      (filters.qualification === 'unqualified' && !rec.match_analysis.is_qualified);
    
    const matchesWorkload = filters.workload === 'all' ||
      (filters.workload === 'available' && rec.workload.current_projects === 0) ||
      (filters.workload === 'light' && rec.workload.current_projects <= 2) ||
      (filters.workload === 'heavy' && rec.workload.current_projects > 2);
    
    const matchesMinMatch = rec.match_analysis.overall_match >= filters.minMatch;
    
    return matchesSearch && matchesQualification && matchesWorkload && matchesMinMatch;
  }) || [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Assignments</h1>
        <p className="text-gray-600 mt-2">Manage project assignments with intelligent skill-based recommendations</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.active_assignments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Users</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.users_with_assignments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Projects/User</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.avg_assignments_per_user}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.completed_assignments}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Smart Recommendations
            </div>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Current Assignments
            </div>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manual'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Manual Assignment
            </div>
          </button>
        </nav>
      </div>

      {/* Smart Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Project Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Project</h2>
              <button
                onClick={loadRecommendations}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
            
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.status}) - Priority: {project.priority || 'normal'}
                </option>
              ))}
            </select>
          </div>

          {/* Filters */}
          {selectedProject && recommendations && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Candidates</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Name, email, department..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <select
                    value={filters.qualification}
                    onChange={(e) => setFilters({...filters, qualification: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All candidates</option>
                    <option value="qualified">Qualified only</option>
                    <option value="unqualified">Needs training</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workload</label>
                  <select
                    value={filters.workload}
                    onChange={(e) => setFilters({...filters, workload: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All workloads</option>
                    <option value="available">Available</option>
                    <option value="light">Light load (≤2)</option>
                    <option value="heavy">Heavy load (>2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Match %</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minMatch}
                    onChange={(e) => setFilters({...filters, minMatch: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">{filters.minMatch}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Project Summary */}
          {recommendations && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommendations for: {recommendations.project.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{filteredRecommendations.length}</div>
                  <div className="text-sm text-blue-600">Total Candidates</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredRecommendations.filter(r => r.match_analysis.is_qualified).length}
                  </div>
                  <div className="text-sm text-green-600">Qualified</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {recommendations.summary.avg_match_score}%
                  </div>
                  <div className="text-sm text-purple-600">Avg. Match</div>
                </div>
              </div>

              {/* Required Skills */}
              {recommendations.project.required_skills && recommendations.project.required_skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.project.required_skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          skill.ProjectSkill?.is_mandatory
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {skill.name} (Level {skill.ProjectSkill?.required_level || 1})
                        {skill.ProjectSkill?.is_mandatory && ' *'}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">* Required skills</div>
                </div>
              )}
            </div>
          )}

          {/* Candidate Recommendations */}
          {filteredRecommendations.length > 0 ? (
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation, index) => (
                <div key={recommendation.user.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {recommendation.user.name}
                          </h3>
                          <div className="text-sm text-gray-600">
                            {recommendation.user.email} • {recommendation.user.department} • {recommendation.user.position}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            #{index + 1}
                          </div>
                          <div className="text-xs text-gray-500">Rank</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Skill Match</div>
                          <SkillMatchIndicator
                            matchPercentage={recommendation.match_analysis.overall_match}
                            isQualified={recommendation.match_analysis.is_qualified}
                            showText={false}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Mandatory: {recommendation.match_analysis.mandatory_match}% • 
                            Optional: {recommendation.match_analysis.optional_match}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Workload</div>
                          <WorkloadIndicator
                            currentProjects={recommendation.workload.current_projects}
                            availabilityScore={recommendation.workload.availability_score}
                            activeAssignments={recommendation.workload.active_assignments}
                            detailed={false}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Overall Score</div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {recommendation.match_analysis.recommendation_score}
                          </div>
                        </div>
                      </div>

                      {/* Skill Gap Analysis */}
                      <SkillGapAnalysis
                        skillGaps={recommendation.skill_details.gaps}
                        skillStrengths={recommendation.skill_details.strengths}
                        isExpanded={false}
                      />
                    </div>
                  </div>

                  {/* Assignment Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="text"
                          placeholder="Role (e.g., Frontend Developer)"
                          value={assignmentForm.role}
                          onChange={(e) => setAssignmentForm({...assignmentForm, role: e.target.value})}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Hours"
                          value={assignmentForm.hours_allocated}
                          onChange={(e) => setAssignmentForm({...assignmentForm, hours_allocated: e.target.value})}
                          className="border border-gray-300 rounded px-3 py-2 text-sm w-20"
                        />
                        <input
                          type="number"
                          placeholder="Rate/hr"
                          value={assignmentForm.hourly_rate}
                          onChange={(e) => setAssignmentForm({...assignmentForm, hourly_rate: e.target.value})}
                          className="border border-gray-300 rounded px-3 py-2 text-sm w-24"
                        />
                      </div>
                      <button
                        onClick={() => handleAssignment(recommendation.user.id)}
                        disabled={assignmentLoading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {assignmentLoading ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedProject && recommendations ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates match your filters</h3>
              <p className="text-gray-600">Try adjusting your filter criteria to see more candidates.</p>
            </div>
          ) : selectedProject ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading recommendations...</h3>
              <p className="text-gray-600">Analyzing skills and generating recommendations.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Current Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.User?.first_name} {assignment.User?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.User?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.Project?.name}</div>
                      <div className="text-sm text-gray-500">
                        Priority: {assignment.Project?.priority || 'normal'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.hours_worked || 0} / {assignment.hours_allocated || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.performance_rating ? (
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">{assignment.performance_rating}/5</div>
                          <div className="ml-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`${i < assignment.performance_rating ? 'text-yellow-400' : 'text-gray-400'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assignments.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600">Start by assigning users to projects using the recommendations tab.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Assignment Tab */}
      {activeTab === 'manual' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Manual Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a project...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} - {user.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                placeholder="e.g., Frontend Developer"
                value={assignmentForm.role}
                onChange={(e) => setAssignmentForm({...assignmentForm, role: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Hours</label>
              <input
                type="number"
                placeholder="40"
                value={assignmentForm.hours_allocated}
                onChange={(e) => setAssignmentForm({...assignmentForm, hours_allocated: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
              <input
                type="number"
                placeholder="75"
                value={assignmentForm.hourly_rate}
                onChange={(e) => setAssignmentForm({...assignmentForm, hourly_rate: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={assignmentForm.validate_skills}
                onChange={(e) => setAssignmentForm({...assignmentForm, validate_skills: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Validate user skills against project requirements</span>
            </label>
          </div>

          <div className="mt-8">
            <button
              onClick={() => handleAssignment(selectedUser, selectedProject)}
              disabled={!selectedProject || !selectedUser || assignmentLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {assignmentLoading ? 'Assigning...' : 'Assign User to Project'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAssignments;