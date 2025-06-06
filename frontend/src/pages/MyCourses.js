import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { courseEnrollmentsAPI } from '../services/api';
import { 
  BookOpen, 
  Clock, 
  Calendar,
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  XCircle,
  RotateCcw,
  Target
} from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, in_progress, completed, enrolled
  const [updatingProgress, setUpdatingProgress] = useState({});

  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    if (authUser?.id) {
      loadEnrollments();
    }
  }, [authUser]);

  const loadEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await courseEnrollmentsAPI.getUserEnrollments(authUser.id);
      setEnrollments(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError('Failed to load your courses');
      setEnrollments([]);
    }
    setLoading(false);
  };

  const updateProgress = async (enrollmentId, progressData) => {
    setUpdatingProgress(prev => ({ ...prev, [enrollmentId]: true }));
    try {
      await courseEnrollmentsAPI.updateProgress(enrollmentId, progressData);
      loadEnrollments(); // Refresh data
    } catch (err) {
      alert('Failed to update progress: ' + (err.response?.data?.error?.message || err.message));
    }
    setUpdatingProgress(prev => ({ ...prev, [enrollmentId]: false }));
  };

  const markAsCompleted = (enrollmentId) => {
    if (window.confirm('Mark this course as completed?')) {
      updateProgress(enrollmentId, { progress_percentage: 100, status: 'completed' });
    }
  };

  const resumeCourse = (enrollmentId, currentProgress) => {
    const newProgress = prompt(`Enter your current progress percentage (0-100):`, currentProgress || 0);
    if (newProgress !== null) {
      const progress = parseInt(newProgress);
      if (progress >= 0 && progress <= 100) {
        const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'enrolled';
        updateProgress(enrollmentId, { progress_percentage: progress, status });
      } else {
        alert('Please enter a valid percentage between 0 and 100');
      }
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filter === 'all') return true;
    return enrollment.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'dropped':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return { total, completed, inProgress, averageProgress };
  };

  const stats = calculateStats();

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
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">Track your learning progress and continue your education</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Courses', count: stats.total },
              { key: 'in_progress', label: 'In Progress', count: stats.inProgress },
              { key: 'completed', label: 'Completed', count: stats.completed },
              { key: 'enrolled', label: 'Not Started', count: enrollments.filter(e => e.status === 'enrolled').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-6">
        {filteredEnrollments.map(enrollment => (
          <div key={enrollment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getStatusIcon(enrollment.status)}
                    <h3 className="text-xl font-semibold text-gray-900 ml-2">
                      {enrollment.Course?.title || 'Course Title Not Available'}
                    </h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                      {enrollment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {enrollment.Course?.description || 'No description available'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </div>
                    {enrollment.Course?.duration_hours && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        Duration: {enrollment.Course.duration_hours} hours
                      </div>
                    )}
                    {enrollment.completion_date && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Award className="w-4 h-4 mr-2" />
                        Completed: {new Date(enrollment.completion_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="ml-6 flex flex-col space-y-2">
                  {enrollment.status === 'completed' ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Course Completed
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => resumeCourse(enrollment.id, enrollment.progress_percentage)}
                        disabled={updatingProgress[enrollment.id]}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center text-sm"
                      >
                        {updatingProgress[enrollment.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {enrollment.status === 'enrolled' ? 'Start' : 'Continue'}
                      </button>

                      {enrollment.progress_percentage < 100 && (
                        <button
                          onClick={() => markAsCompleted(enrollment.id)}
                          disabled={updatingProgress[enrollment.id]}
                          className="border border-green-300 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center text-sm"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Mark Complete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEnrollments.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No courses enrolled' : `No ${filter.replace('_', ' ')} courses`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Start your learning journey by enrolling in your first course.'
              : `You don't have any ${filter.replace('_', ' ')} courses yet.`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => window.location.href = '/courses'}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Courses
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;