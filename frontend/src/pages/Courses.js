import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  DollarSign,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Grid,
  List
} from 'lucide-react';
import { coursesAPI, skillsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty_level: '',
    skill_id: '',
    min_duration: '',
    max_duration: '',
    max_price: '',
    user_enrolled: '',
    sort_by: 'created_at',
    sort_order: 'DESC'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const authUser = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    loadSkills();
    loadCategories();
  }, []);

  // Load courses when filters change
  useEffect(() => {
    loadCourses();
  }, [filters, pagination.page]);

  const loadSkills = async () => {
    try {
      const res = await skillsAPI.getAll();
      setSkills(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await coursesAPI.getCategories();
      setCategories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const res = await coursesAPI.getAll(queryParams);
      setCourses(Array.isArray(res.data.data) ? res.data.data : []);
      
      if (res.data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages
        }));
      }
    } catch (err) {
      setError('Failed to load courses');
      setCourses([]);
    }
    setLoading(false);
  }, [filters, pagination.page, pagination.limit]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      difficulty_level: '',
      skill_id: '',
      min_duration: '',
      max_duration: '',
      max_price: '',
      user_enrolled: '',
      sort_by: 'created_at',
      sort_order: 'DESC'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEnroll = async (courseId) => {
    if (!authUser) {
      alert('Please log in to enroll in courses');
      return;
    }

    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      await coursesAPI.enrollInCourse(courseId);
      
      // Update course enrollment status in local state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { 
              ...course, 
              is_enrolled: true, 
              enrollment_status: 'enrolled',
              enrollment_count: course.enrollment_count + 1
            }
          : course
      ));
      
      alert('Successfully enrolled in course!');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to enroll in course';
      alert(errorMessage);
    }
    setEnrolling(prev => ({ ...prev, [courseId]: false }));
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      await coursesAPI.unenrollFromCourse(courseId);
      
      // Update course enrollment status in local state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { 
              ...course, 
              is_enrolled: false, 
              enrollment_status: null,
              enrollment_count: Math.max(0, course.enrollment_count - 1)
            }
          : course
      ));
      
      alert('Successfully unenrolled from course');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to unenroll from course';
      alert(errorMessage);
    }
    setEnrolling(prev => ({ ...prev, [courseId]: false }));
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'enrolled': return 'text-yellow-600';
      case 'dropped': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'enrolled': return <BookOpen className="w-4 h-4" />;
      case 'dropped': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Course Image/Header */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {course.course_image ? (
          <img 
            src={course.course_image} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <BookOpen className="w-16 h-16" />
          </div>
        )}
        
        {/* Difficulty Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
            {course.difficulty_level}
          </span>
        </div>
        
        {/* Enrollment Status Badge */}
        {course.is_enrolled && (
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white ${getStatusColor(course.enrollment_status)} flex items-center gap-1`}>
              {getStatusIcon(course.enrollment_status)}
              {course.enrollment_status}
            </span>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{course.category}</p>
          {course.description && (
            <p className="text-sm text-gray-700 line-clamp-2">{course.description}</p>
          )}
        </div>

        {/* Instructor */}
        {course.instructor_name && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Instructor:</span> {course.instructor_name}
            </p>
          </div>
        )}

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration_hours || 0}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.enrollment_count || 0} enrolled</span>
          </div>
          {course.price > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${course.price}</span>
            </div>
          )}
          {course.completion_rate !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{course.completion_rate}% completion</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {course.Skills && course.Skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Skills you'll learn:</p>
            <div className="flex flex-wrap gap-1">
              {course.Skills.slice(0, 3).map(skill => (
                <span 
                  key={skill.id}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                >
                  {skill.name}
                </span>
              ))}
              {course.Skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                  +{course.Skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          {course.is_enrolled ? (
            <>
              <button
                onClick={() => handleUnenroll(course.id)}
                disabled={enrolling[course.id]}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {enrolling[course.id] ? 'Processing...' : 'Unenroll'}
              </button>
              {course.enrollment_status === 'in_progress' && (
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
                  Continue
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => handleEnroll(course.id)}
              disabled={enrolling[course.id] || !authUser}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              {enrolling[course.id] ? 'Enrolling...' : 'Enroll'}
            </button>
          )}
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium border border-gray-300"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Course Thumbnail */}
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              {course.course_image ? (
                <img 
                  src={course.course_image} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="w-8 h-8" />
              )}
            </div>
            
            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                  {course.difficulty_level}
                </span>
                {course.is_enrolled && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white ${getStatusColor(course.enrollment_status)} flex items-center gap-1`}>
                    {getStatusIcon(course.enrollment_status)}
                    {course.enrollment_status}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-2">{course.category}</p>
              
              {course.description && (
                <p className="text-gray-700 mb-3 line-clamp-2">{course.description}</p>
              )}
              
              {course.instructor_name && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Instructor:</span> {course.instructor_name}
                </p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_hours || 0}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollment_count || 0} enrolled</span>
                </div>
                {course.price > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${course.price}</span>
                  </div>
                )}
                {course.completion_rate !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{course.completion_rate}% completion</span>
                  </div>
                )}
              </div>
              
              {/* Skills */}
              {course.Skills && course.Skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Skills you'll learn:</p>
                  <div className="flex flex-wrap gap-1">
                    {course.Skills.map(skill => (
                      <span 
                        key={skill.id}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-6">
          {course.is_enrolled ? (
            <>
              <button
                onClick={() => handleUnenroll(course.id)}
                disabled={enrolling[course.id]}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {enrolling[course.id] ? 'Processing...' : 'Unenroll'}
              </button>
              {course.enrollment_status === 'in_progress' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
                  Continue
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => handleEnroll(course.id)}
              disabled={enrolling[course.id] || !authUser}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              {enrolling[course.id] ? 'Enrolling...' : 'Enroll'}
            </button>
          )}
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium border border-gray-300"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">Discover and enroll in courses to enhance your skills</p>
        </div>
        {/* Create Course Button for admin/manager */}
        {authUser && (authUser.role === 'admin' || authUser.role === 'manager') && (
          <a
            href="/courses/create"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-base text-center"
          >
            + Create Course
          </a>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={filters.difficulty_level}
                  onChange={(e) => handleFilterChange('difficulty_level', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Skill Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                <select
                  value={filters.skill_id}
                  onChange={(e) => handleFilterChange('skill_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Skills</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>

              {/* Enrollment Status Filter */}
              {authUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment</label>
                  <select
                    value={filters.user_enrolled}
                    onChange={(e) => handleFilterChange('user_enrolled', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Courses</option>
                    <option value="false">Not Enrolled</option>
                    <option value="true">Enrolled</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Duration Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Duration (hours)</label>
                <input
                  type="number"
                  value={filters.min_duration}
                  onChange={(e) => handleFilterChange('min_duration', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (hours)</label>
                <input
                  type="number"
                  value={filters.max_duration}
                  onChange={(e) => handleFilterChange('max_duration', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                  <option value="price">Price</option>
                  <option value="duration_hours">Duration</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={filters.sort_order}
                  onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {courses.length} of {pagination.total} courses
            {filters.search && ` for "${filters.search}"`}
          </p>
          {pagination.pages > 1 && (
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </div>
          )}
        </div>
      )}

      {/* Courses Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.category || filters.difficulty_level 
              ? 'Try adjusting your filters to see more results.'
              : 'No courses are available at the moment.'}
          </p>
          {(filters.search || filters.category || filters.difficulty_level) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Courses Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {courses.map(course => (
                <CourseListItem key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const startPage = Math.max(1, pagination.page - 2);
                  const pageNumber = startPage + i;
                  
                  if (pageNumber > pagination.pages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
                      className={`px-3 py-2 border text-sm font-medium rounded-md ${
                        pagination.page === pageNumber
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Not Logged In Message */}
      {!authUser && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-700">
              Please log in to enroll in courses and track your progress.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;