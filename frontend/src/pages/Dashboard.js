import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import CourseRecommendations from '../components/CourseRecommendations';
import { usersAPI, coursesAPI } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authUser = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      loadDashboardData();
      loadRecentCourses();
    }
  }, [authUser]);

  const loadDashboardData = async () => {
    try {
      const res = await usersAPI.getDashboard(authUser.id);
      setDashboardData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const loadRecentCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await coursesAPI.getAll({ 
        user_enrolled: 'true', 
        limit: 4,
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
      setRecentCourses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError('Failed to load recent courses');
      setRecentCourses([]);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'enrolled': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100 mr-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-gray-600">{title}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {authUser?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">Here's your learning progress and recommendations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          title="Courses Enrolled"
          value={dashboardData?.stats?.coursesEnrolled || 0}
          subtitle={`${dashboardData?.stats?.coursesCompleted || 0} completed`}
          color="blue"
        />
        <StatCard
          icon={Award}
          title="Badges Earned"
          value={dashboardData?.stats?.badgesEarned || 0}
          color="yellow"
        />
        <StatCard
          icon={Users}
          title="Projects"
          value={dashboardData?.stats?.projectsAssigned || 0}
          subtitle={`${dashboardData?.stats?.projectsCompleted || 0} completed`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Tokens Earned"
          value={dashboardData?.stats?.totalTokensEarned || 0}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Recommendations */}
          <CourseRecommendations limit={6} />

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Recent Activity
            </h2>

            {dashboardData?.recent ? (
              <div className="space-y-4">
                {/* Recent Courses */}
                {dashboardData.recent.courses?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Course Progress</h3>
                    <div className="space-y-2">
                      {dashboardData.recent.courses.slice(0, 3).map(enrollment => (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{enrollment.Course?.title}</p>
                            <p className="text-sm text-gray-600">Progress: {enrollment.progress_percentage}%</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Badges */}
                {dashboardData.recent.badges?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Recent Achievements</h3>
                    <div className="space-y-2">
                      {dashboardData.recent.badges.slice(0, 2).map(userBadge => (
                        <div key={userBadge.id} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                          <Award className="w-5 h-5 text-yellow-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{userBadge.Badge?.name}</p>
                            <p className="text-sm text-gray-600">
                              Earned {new Date(userBadge.earned_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Projects */}
                {dashboardData.recent.projects?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Project Updates</h3>
                    <div className="space-y-2">
                      {dashboardData.recent.projects.slice(0, 2).map(assignment => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{assignment.Project?.name}</p>
                            <p className="text-sm text-gray-600">Role: {assignment.role}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No recent activity to show yet.</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start learning today!
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Courses</h3>
              <button
                onClick={() => navigate('/courses?user_enrolled=true')}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="space-y-3">
                {recentCourses.map(course => (
                  <div 
                    key={course.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <h4 className="font-medium text-gray-900 text-sm">{course.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{course.category}</p>
                    {course.CourseEnrollments?.[0] && (
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${course.CourseEnrollments[0].progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {course.CourseEnrollments[0].progress_percentage || 0}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm mb-3">No enrolled courses yet</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/courses')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Browse Courses</div>
                  <div className="text-sm text-gray-600">Find new learning opportunities</div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Users className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Update Profile</div>
                  <div className="text-sm text-gray-600">Manage your skills and info</div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/projects')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Target className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">View Projects</div>
                  <div className="text-sm text-gray-600">Check your project assignments</div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/analytics')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <BarChart3 className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">View Analytics</div>
                  <div className="text-sm text-gray-600">Track your progress</div>
                </div>
              </button>
            </div>
          </div>

          {/* Learning Goals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Goals</h3>
            {dashboardData?.stats ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Course Completion</span>
                    <span className="text-sm text-gray-600">
                      {dashboardData.stats.coursesCompleted}/{dashboardData.stats.coursesEnrolled}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${dashboardData.stats.coursesEnrolled > 0 
                          ? (dashboardData.stats.coursesCompleted / dashboardData.stats.coursesEnrolled) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Project Completion</span>
                    <span className="text-sm text-gray-600">
                      {dashboardData.stats.projectsCompleted}/{dashboardData.stats.projectsAssigned}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${dashboardData.stats.projectsAssigned > 0 
                          ? (dashboardData.stats.projectsCompleted / dashboardData.stats.projectsAssigned) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Set learning goals to track progress</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;