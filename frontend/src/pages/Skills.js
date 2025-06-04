import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, Search, Filter, Download, Upload, 
  Edit2, Trash2, Users, TrendingUp, 
  BookOpen, Award, ChevronDown, X
} from 'lucide-react';
import { skillsAPI, handleApiError } from '../services/api';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const authUser = useSelector(state => state.auth.user);
  const isAdmin = authUser?.role === 'admin';
  const isManager = authUser?.role === 'manager' || isAdmin;

  // Form states
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'technical',
    description: ''
  });

  const [editSkill, setEditSkill] = useState({
    name: '',
    category: '',
    description: ''
  });

  const [bulkImportData, setBulkImportData] = useState('');

  // Load data on component mount and when filters change
  useEffect(() => {
    loadSkills();
    loadCategories();
    if (isManager) {
      loadStatistics();
    }
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage, isManager]);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        sort: sortBy,
        order: sortOrder,
        include_stats: isManager ? 'true' : 'false'
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;

      const response = await skillsAPI.getAll(params);
      setSkills(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      setSkills([]);
    }
    setLoading(false);
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage, isManager]);

  const loadCategories = async () => {
    try {
      const response = await skillsAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await skillsAPI.getStatistics();
      setStatistics(response.data.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await skillsAPI.create(newSkill);
      setShowCreateModal(false);
      setNewSkill({ name: '', category: 'technical', description: '' });
      loadSkills();
      loadCategories();
      if (isManager) loadStatistics();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    setCreating(false);
  };

  const handleEditSkill = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      await skillsAPI.update(selectedSkill.id, editSkill);
      setShowEditModal(false);
      setSelectedSkill(null);
      loadSkills();
      loadCategories();
      if (isManager) loadStatistics();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    setUpdating(false);
  };

  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Are you sure you want to delete "${skill.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await skillsAPI.delete(skill.id);
      loadSkills();
      loadCategories();
      if (isManager) loadStatistics();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    setDeleting(false);
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkImportData.trim()) return;

    setCreating(true);
    setError(null);

    try {
      // Parse CSV-like data
      const lines = bulkImportData.trim().split('\n');
      const skills = lines.map(line => {
        const [name, category, description] = line.split(',').map(s => s.trim());
        return { name, category: category || 'technical', description: description || '' };
      }).filter(skill => skill.name);

      const response = await skillsAPI.bulkImport({ skills });
      setShowBulkImport(false);
      setBulkImportData('');
      loadSkills();
      loadCategories();
      if (isManager) loadStatistics();
      
      // Show results
      alert(`Import completed:\nCreated: ${response.data.data.created.length}\nSkipped: ${response.data.data.skipped.length}\nErrors: ${response.data.data.errors.length}`);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
    setCreating(false);
  };

  const openEditModal = (skill) => {
    setSelectedSkill(skill);
    setEditSkill({
      name: skill.name,
      category: skill.category,
      description: skill.description || ''
    });
    setShowEditModal(true);
  };

  const exportSkills = () => {
    const csvContent = skills.map(skill => 
      `"${skill.name}","${skill.category}","${skill.description || ''}"`
    ).join('\n');
    
    const blob = new Blob([`Name,Category,Description\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categoryColors = {
    technical: 'bg-blue-100 text-blue-800',
    soft: 'bg-green-100 text-green-800',
    leadership: 'bg-purple-100 text-purple-800',
    business: 'bg-orange-100 text-orange-800',
    creative: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const validCategories = [
    { value: 'technical', label: 'Technical' },
    { value: 'soft', label: 'Soft Skills' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'business', label: 'Business' },
    { value: 'creative', label: 'Creative' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
            <p className="text-gray-600 mt-2">Manage organizational skills and competencies</p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkImport(true)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </button>
              <button
                onClick={exportSkills}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards (Admin/Manager only) */}
      {isManager && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overview.total_skills}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">User Skills</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overview.total_user_skills}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Skills/User</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overview.average_skills_per_user}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {validCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="created_at">Date Created</option>
                  {isManager && <option value="user_count">User Count</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>
            </div>
            
            {(searchTerm || selectedCategory) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Category: {validCategories.find(c => c.value === selectedCategory)?.label}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Skills Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Skill Name
                    {sortBy === 'name' && (
                      <span className="ml-2">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === 'category' && (
                      <span className="ml-2">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                {isManager && (
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('user_count')}
                  >
                    <div className="flex items-center">
                      Users
                      {sortBy === 'user_count' && (
                        <span className="ml-2">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                )}
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : skills.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || selectedCategory ? 'No skills match your filters' : 'No skills found'}
                  </td>
                </tr>
              ) : (
                skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[skill.category] || categoryColors.other}`}>
                        {validCategories.find(c => c.value === skill.category)?.label || skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {skill.description || 'No description'}
                      </div>
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {skill.user_count || 0}
                        </div>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(skill)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit skill"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill)}
                            disabled={deleting}
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            title="Delete skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total skills)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Skill Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Skill</h3>
            </div>
            
            <form onSubmit={handleCreateSkill} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React.js, Leadership, Data Analysis"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {validCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Brief description of the skill..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSkill({ name: '', category: 'technical', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Skill'}
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
              <h3 className="text-lg font-medium text-gray-900">Edit Skill</h3>
            </div>
            
            <form onSubmit={handleEditSkill} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={editSkill.name}
                    onChange={(e) => setEditSkill({ ...editSkill, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={editSkill.category}
                    onChange={(e) => setEditSkill({ ...editSkill, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {validCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editSkill.description}
                    onChange={(e) => setEditSkill({ ...editSkill, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
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

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bulk Import Skills</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter skills in CSV format: Name, Category, Description (one per line)
              </p>
            </div>
            
            <form onSubmit={handleBulkImport} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Data
                  </label>
                  <textarea
                    value={bulkImportData}
                    onChange={(e) => setBulkImportData(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="10"
                    placeholder="React.js, technical, JavaScript library for building user interfaces&#10;Leadership, soft, Ability to guide and inspire teams&#10;Python, technical, Programming language for data science"
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  <p><strong>Format:</strong> Name, Category, Description</p>
                  <p><strong>Categories:</strong> technical, soft, leadership, business, creative, other</p>
                  <p><strong>Note:</strong> Description is optional</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkImportData('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !bulkImportData.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Importing...' : 'Import Skills'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;