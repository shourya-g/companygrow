import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  DollarSign,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Play,
  CheckCircle
} from 'lucide-react';
import { coursesAPI } from '../services/api';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const coursesPerPage = 12;

  // Load courses with filters
  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: coursesPerPage,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDifficulty) params.difficulty_level = selectedDifficulty;
      
      const response = await coursesAPI.getAll(params);
      
      if (response.data.success) {
        setCourses(response.data.data);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalCourses(response.data.pagination?.total || 0);
      } else {
        setError('Failed to load courses');
      }
    } catch (err) {
      console.error('Load courses error:', err);
      setError('Failed to load courses');
    }
    
    setLoading(false);
  }, [currentPage, searchTerm, selectedCategory, selectedDifficulty, sortBy, sortOrder]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await coursesAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Load categories error:', err);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
        break;
      case 'sort':
        const [field, order] = value.split('-');
        setSortBy(field);
        setSortOrder(order);
        break;
      default:
        break;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setCurrentPage(1);
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      return;
    }
    
    try {
      await coursesAPI.delete(courseId);
      loadCourses();
    } catch (err) {
      console.error('Delete course error:', err);
      alert('Failed to delete course. It may have existing enrollments.');
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user can manage courses
  const canManageCourses = user && ['admin', 'manager'].includes(user.role);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-2">
              Discover and enroll in courses to enhance your skills
            </p>
          </div>
          {canManageCourses && (
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => navigate('/courses/create')}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses by title, description, or instructor..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Results count */}
            <span className="text-sm text-gray-500">
              {totalCourses} course{totalCourses !== 1 ? 's' : ''} found
            </span>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category || cat.name} value={cat.category || cat.name}>
                      {(cat.category || cat.name) + (cat.course_count !== undefined ? ` (${cat.course_count})` : '')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="created_at-DESC">Newest First</option>
                  <option value="created_at-ASC">Oldest First</option>
                  <option value="title-ASC">Title A-Z</option>
                  <option value="title-DESC">Title Z-A</option>
                  <option value="duration_hours-ASC">Duration (Short)</option>
                  <option value="duration_hours-DESC">Duration (Long)</option>
                  <option value="price-ASC">Price (Low)</option>
                  <option value="price-DESC">Price (High)</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Course Grid */}
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory || selectedDifficulty
                  ? 'Try adjusting your search criteria.'
                  : 'No courses are available at the moment.'}
              </p>
              {canManageCourses && (
                <button
                  onClick={() => navigate('/courses/create')}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Course
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center">
                    {course.course_image ? (
                      <img
                        src={course.course_image}
                        alt={course.title || 'Course'}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-white" />
                    )}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                      {course.difficulty_level || 'N/A'}
                    </div>
                    {course.price > 0 && (
                      <div className="absolute top-3 right-3 bg-white text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                        ${course.price}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {course.title || 'Untitled Course'}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {course.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration_hours || 0}h
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.stats?.total_enrollments || 0}
                      </div>
                      {course.stats?.avg_progress > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {course.stats.avg_progress}%
                        </div>
                      )}
                    </div>
                    {course.instructor_name && (
                      <div className="text-sm text-gray-600 mb-4">
                        Instructor: {course.instructor_name}
                      </div>
                    )}
                    {course.Skills && course.Skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {course.Skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {course.Skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{course.Skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/courses/${course.id}`}
                        className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      {canManageCourses && (
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/courses/${course.id}/edit`}
                            className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Courses;