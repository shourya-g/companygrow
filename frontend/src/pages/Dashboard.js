import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  Play,
  BarChart3,
  Calendar,
  Target,
  ArrowRight,
  GraduationCap,
  User,
  FolderOpen
} from 'lucide-react';
import { 
  coursesAPI, 
  courseEnrollmentsAPI, 
  analyticsAPI,
  usersAPI 
} from '../services/api';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    enrollments: [],
    recentCourses: [],
    stats: {
      totalCourses: 0,
      totalEnrollments: 0,
      completedCourses: 0,
      avgProgress: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (user.role === 'admin' || user.role === 'manager') {
        await loadAdminDashboard();
      } else {
        await loadStudentDashboard();
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    }

    setLoading(false);
  };

  const loadAdminDashboard = async () => {
    try {
      // Load courses overview
      const coursesResponse = await coursesAPI.getAll({ limit: 5 });
      const popularResponse = await coursesAPI.getPopular(5);
      
      // Load analytics if available
      let courseStats = {
        totalCourses: 0,
        totalEnrollments: 0,
        completedCourses: 0,
        avgProgress: 0
      };

      try {
        const analyticsResponse = await analyticsAPI.getCourseStats();
        if (analyticsResponse.data.success) {
          courseStats = {
            totalCourses: analyticsResponse.data.totalCourses || 0,
            totalEnrollments: analyticsResponse.data.totalEnrollments || 0,
            completedCourses: analyticsResponse.data.completedCourses || 0,
            avgProgress: analyticsResponse.data.avgProgress || 0
          };
        }
      } catch (analyticsError) {
        console.log('Analytics not available, using basic stats');
      }

      setDashboardData({
        courses: coursesResponse.data.success ? coursesResponse.data.data : [],
        recentCourses: popularResponse.data.success ? popularResponse.data.data : [],
        enrollments: [],
        stats: courseStats
      });
    } catch (err) {
      throw err;
    }
  };

  const loadStudentDashboard = async () => {
    try {
      // Load user's enrollments
      const enrollmentsResponse = await courseEnrollmentsAPI.getUserEnrollments(user.id);
      const enrollments = enrollmentsResponse.data.success ? enrollmentsResponse.data.data : [];

      // Load recommended courses
      const recommendedResponse = await coursesAPI.getRecommended(5);
      const recommended = recommendedResponse.data.success ? recommendedResponse.data.data : [];

      // Calculate user stats
      const stats = {
        totalCourses: enrollments.length,
        totalEnrollments: enrollments.length,
        completedCourses: enrollments.filter(e => e.status === 'completed').length,
        avgProgress: enrollments.length > 0 
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
          : 0
      };

      setDashboardData({
        courses: Array.isArray(recommended) ? recommended : [],
        enrollments: Array.isArray(enrollments) ? enrollments.slice(0, 5) : [],
        recentCourses: Array.isArray(recommended) ? recommended : [],
        stats
      });
    } catch (err) {
      throw err;
    }
  };

  const isAdmin = user && ['admin', 'manager'].includes(user.role);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'Admin Dashboard' : 'My Learning Dashboard'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdmin 
            ? 'Manage courses and track platform performance'
            : 'Track your learning progress and discover new courses'
          }
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.totalCourses}
              </div>
              <div className="text-sm text-gray-500">
                {isAdmin ? 'Total Courses' : 'Enrolled Courses'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            {isAdmin ? (
              <Users className="w-8 h-8 text-green-600" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {isAdmin ? dashboardData.stats.totalEnrollments : dashboardData.stats.completedCourses}
              </div>
              <div className="text-sm text-gray-500">
                {isAdmin ? 'Total Enrollments' : 'Completed'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.avgProgress}%
              </div>
              <div className="text-sm text-gray-500">
                {isAdmin ? 'Platform Avg Progress' : 'Your Avg Progress'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {isAdmin ? dashboardData.stats.completedCourses : dashboardData.enrollments.filter(e => e.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-500">
                {isAdmin ? 'Completed Courses' : 'In Progress'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Recent/Enrolled Courses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isAdmin ? 'Recent Courses' : 'My Enrollments'}
                </h2>
                <Link
                  to={isAdmin ? '/courses' : '/my-enrollments'}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {(isAdmin ? dashboardData.courses : dashboardData.enrollments).length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {isAdmin ? 'No courses created yet' : 'No enrollments yet'}
                  </p>
                  <Link
                    to={isAdmin ? '/courses/create' : '/courses'}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAdmin ? 'Create Course' : 'Browse Courses'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {(isAdmin ? dashboardData.courses : dashboardData.enrollments).map((item) => {
                    const course = isAdmin ? item : item.Course;
                    const enrollment = isAdmin ? null : item;
                    
                    return (
                      <div key={isAdmin ? course.id : enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {course?.title || 'Unknown Course'}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {course?.duration_hours || 0}h
                            </span>
                            {!isAdmin && enrollment && (
                              <span className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {enrollment.progress_percentage || 0}%
                              </span>
                            )}
                            {isAdmin && course?.stats && (
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {course.stats.total_enrollments || 0} students
                              </span>
                            )}
                          </div>
                          {!isAdmin && enrollment && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${enrollment.progress_percentage || 0}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/courses/${course?.id}`}
                          className="ml-4 p-2 text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {isAdmin ? (
                <>
                  <Link
                    to="/courses/create"
                    className="flex items-center justify-center p-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Course
                  </Link>
                  <Link
                    to="/analytics"
                    className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Analytics
                  </Link>
                  <Link
                    to="/users"
                    className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Manage Users
                  </Link>
                  <Link
                    to="/project-assignments"
                    className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Assignments
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/courses"
                    className="flex items-center justify-center p-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Browse Courses
                  </Link>
                  <Link
                    to="/my-enrollments"
                    className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    My Learning
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <User className="w-5 h-5 mr-2" />
                    My Profile
                  </Link>
                  <Link
                    to="/projects"
                    className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Projects
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recommended/Popular Courses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isAdmin ? 'Popular Courses' : 'Recommended for You'}
                </h2>
                <Link
                  to="/courses"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {dashboardData.recentCourses.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No courses available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="capitalize">{course.difficulty_level}</span>
                          <span>{course.category}</span>
                          {course.duration_hours && (
                            <span>{course.duration_hours}h</span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="ml-4 p-2 text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Welcome to CompanyGrow!</p>
                  <p className="text-xs text-gray-500">Get started by exploring courses</p>
                </div>
              </div>
              {!isAdmin && dashboardData.enrollments.length > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      You have {dashboardData.enrollments.length} active enrollment{dashboardData.enrollments.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">Continue your learning journey</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;