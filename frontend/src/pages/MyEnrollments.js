import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Filter,
  CheckCircle,
  Play,
  AlertCircle,
  Calendar,
  Search,
  Eye,
  RotateCcw,
  X
} from 'lucide-react';
import { courseEnrollmentAPI } from '../services/api';
import CourseProgress from '../components/CourseProgress';

const MyEnrollments = () => {
  const { user } = useSelector(state => state.auth);
  
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [deEnrollingId, setDeEnrollingId] = useState(null);

  // Load user enrollments
  const loadEnrollments = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await courseEnrollmentAPI.getUserEnrollments(user.id);
      if (response.data.success) {
        setEnrollments(response.data.data);
      }
    } catch (err) {
      console.error('Load enrollments error:', err);
      setError('Failed to load your enrollments');
    }
    
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  // Filter enrollments based on search and status
  useEffect(() => {
    let filtered = enrollments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(enrollment =>
        enrollment.Course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.Course?.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.status === statusFilter);
    }

    setFilteredEnrollments(filtered);
  }, [enrollments, searchTerm, statusFilter]);

  const handleProgressUpdate = (updatedEnrollment) => {
    setEnrollments(prev => 
      prev.map(enrollment => 
        enrollment.id === updatedEnrollment.id ? updatedEnrollment : enrollment
      )
    );
    setSelectedEnrollment(updatedEnrollment);
  };

  const handleDeEnroll = async (enrollmentId) => {
    setDeEnrollingId(enrollmentId);
    try {
      await courseEnrollmentAPI.unenroll(enrollmentId);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (err) {
      setError('Failed to de-enroll from course');
    }
    setDeEnrollingId(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'enrolled':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'dropped':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'enrolled':
        return 'bg-yellow-100 text-yellow-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const calculateOverallStats = () => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0);
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return { total, completed, inProgress, avgProgress };
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
        <p className="text-gray-600 mt-2">
          Track your progress and manage your enrolled courses
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Courses</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Play className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</div>
              <div className="text-sm text-gray-500">Avg Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-gray-600 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            <button
              onClick={loadEnrollments}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No courses match your filters' : 'No enrollments yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria.'
              : 'Start learning by enrolling in courses that interest you.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Course Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {enrollment.Course?.title || 'Unknown Course'}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {getStatusIcon(enrollment.status)}
                        <span className="ml-1 capitalize">{enrollment.status.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {enrollment.Course?.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {enrollment.Course?.category && (
                        <span className="inline-flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {enrollment.Course.category}
                        </span>
                      )}
                      
                      {enrollment.Course?.difficulty_level && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(enrollment.Course.difficulty_level)}`}>
                          {enrollment.Course.difficulty_level}
                        </span>
                      )}
                      
                      {enrollment.Course?.duration_hours && (
                        <span className="inline-flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {enrollment.Course.duration_hours}h
                        </span>
                      )}
                      
                      <span className="inline-flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Enrolled {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="lg:ml-6 lg:min-w-0 lg:w-80">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {enrollment.progress_percentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            enrollment.status === 'completed' 
                              ? 'bg-green-500' 
                              : enrollment.progress_percentage > 50 
                                ? 'bg-blue-500' 
                                : 'bg-gray-400'
                          }`}
                          style={{ width: `${enrollment.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/courses/${enrollment.Course?.id}`}
                        className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-center text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View Course
                      </Link>
                      {enrollment.status !== 'completed' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setShowProgressModal(true);
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                          >
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            Update
                          </button>
                          <button
                            onClick={() => handleDeEnroll(enrollment.id)}
                            className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-center text-sm font-medium"
                            disabled={deEnrollingId === enrollment.id}
                          >
                            {deEnrollingId === enrollment.id ? 'De-enrolling...' : 'De-enroll'}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Completion Badge */}
                    {enrollment.status === 'completed' && enrollment.completion_date && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center text-xs text-green-600">
                          <Award className="w-3 h-3 mr-1" />
                          Completed on {new Date(enrollment.completion_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Progress - {selectedEnrollment.Course?.title}
                </h2>
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setSelectedEnrollment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <CourseProgress
                enrollment={selectedEnrollment}
                course={selectedEnrollment.Course}
                onProgressUpdate={handleProgressUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;