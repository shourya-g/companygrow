import React, { useEffect, useState } from 'react';
import { dashboardAPI, courseEnrollmentsAPI, handleApiError } from '../services/api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    popularCourses: [],
    recommendedCourses: [],
    userStats: null,
    projectStats: null,
    courseStats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState({}); // Track enrollment status per course
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollError, setEnrollError] = useState(null);
  
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Fetch user's enrollments for button logic
    async function fetchEnrollments() {
      if (!user) return;
      try {
        const res = await courseEnrollmentsAPI.getUserEnrollments(user.id);
        const enrolledIds = Array.isArray(res.data?.data) ? res.data.data.map(e => e.course_id) : [];
        setEnrolledCourses(enrolledIds);
      } catch (e) {
        // ignore
      }
    }
    fetchEnrollments();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading dashboard data...');
      
      // Load dashboard data with individual error handling
      const dataPromises = [
        dashboardAPI.getOverview().catch(err => {
          console.warn('Overview failed:', err.message);
          return { status: 'failed', data: null };
        }),
        dashboardAPI.getPopularCourses(3).catch(err => {
          console.warn('Popular courses failed:', err.message);
          return { status: 'failed', data: { data: [] } };
        }),
        dashboardAPI.getRecommendedCourses(3).catch(err => {
          console.warn('Recommended courses failed:', err.message);
          return { status: 'failed', data: { data: [] } };
        }),
        dashboardAPI.getUserStats().catch(err => {
          console.warn('User stats failed:', err.message);
          return { status: 'failed', data: null };
        }),
        dashboardAPI.getProjectStats().catch(err => {
          console.warn('Project stats failed:', err.message);
          return { status: 'failed', data: null };
        }),
        dashboardAPI.getCourseStats().catch(err => {
          console.warn('Course stats failed:', err.message);
          return { status: 'failed', data: null };
        })
      ];

      const [
        overviewRes,
        popularCoursesRes,
        recommendedCoursesRes,
        userStatsRes,
        projectStatsRes,
        courseStatsRes
      ] = await Promise.all(dataPromises);

      console.log('Popular courses response:', popularCoursesRes);
      console.log('Recommended courses response:', recommendedCoursesRes);

      setDashboardData({
        overview: overviewRes.status !== 'failed' ? overviewRes.data.data : null,
        popularCourses: popularCoursesRes.status !== 'failed' ? 
          popularCoursesRes.data.data : [],
        recommendedCourses: recommendedCoursesRes.status !== 'failed' ? 
          recommendedCoursesRes.data.data : [],
        userStats: userStatsRes.status !== 'failed' ? userStatsRes.data.data : null,
        projectStats: projectStatsRes.status !== 'failed' ? projectStatsRes.data.data : null,
        courseStats: courseStatsRes.status !== 'failed' ? courseStatsRes.data.data : null
      });

      console.log('Dashboard data loaded successfully');

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    setEnrollError(null);
    try {
      await courseEnrollmentsAPI.enroll({ course_id: courseId });
      setEnrolledCourses([...enrolledCourses, courseId]);
    } catch (err) {
      if (err?.response?.status === 409) {
        setEnrolledCourses([...enrolledCourses, courseId]);
        setEnrollError('You are already enrolled in this course.');
      } else {
        setEnrollError('Failed to enroll in course.');
      }
    }
    setEnrollingId(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600">{error}</div>
          <button 
            onClick={loadDashboardData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your CompanyGrow dashboard</p>
        
        {/* Debug Button - Remove in production */}
        <div className="mt-4 flex gap-2">
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardData.userStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.userStats.totalUsers}</p>
            <p className="text-sm text-gray-500">{dashboardData.userStats.activeUsers} active</p>
          </div>
        )}

        {dashboardData.courseStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Courses</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData.courseStats.totalCourses}</p>
            <p className="text-sm text-gray-500">{dashboardData.courseStats.activeCourses} active</p>
          </div>
        )}

        {dashboardData.projectStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboardData.projectStats.totalProjects}</p>
            <p className="text-sm text-gray-500">{dashboardData.projectStats.activeProjects} active</p>
          </div>
        )}

        {dashboardData.courseStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrollments</h3>
            <p className="text-3xl font-bold text-orange-600">{dashboardData.courseStats.totalEnrollments || 0}</p>
            <p className="text-sm text-gray-500">{dashboardData.courseStats.completionRate || 0}% completion</p>
          </div>
        )}
      </div>

      {/* Course Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Popular Courses 
            <span className="text-sm text-gray-500 ml-2">
              ({dashboardData.popularCourses.length} found)
            </span>
          </h2>
          {dashboardData.popularCourses.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.popularCourses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">
                      {course.category} • {course.difficulty_level}
                    </p>
                    {course.instructor_name && (
                      <p className="text-xs text-gray-400">by {course.instructor_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-blue-600 font-medium">
                      {course.enrollment_count || 0} enrolled
                    </span>
                    <br />
                    <button
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mt-1"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      Go to Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No popular courses available</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adding some courses to the database
              </p>
            </div>
          )}
        </div>
        {/* Recommended Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recommended for You
            <span className="text-sm text-gray-500 ml-2">
              ({dashboardData.recommendedCourses.length} found)
            </span>
          </h2>
          {dashboardData.recommendedCourses.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recommendedCourses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">
                      {course.category} • {course.difficulty_level}
                    </p>
                    {course.instructor_name && (
                      <p className="text-xs text-gray-400">by {course.instructor_name}</p>
                    )}
                  </div>
                  <button
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    Go to Course
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No recommended courses available</p>
              <p className="text-xs text-gray-400 mt-1">
                We'll recommend courses based on your skills and interests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;