import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  FolderOpen, 
  Award,
  DollarSign,
  Activity,
  Target,
  Calendar,
  BarChart2
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement, RadialLinearScale } from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement, RadialLinearScale);

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {},
    projects: {},
    skills: {},
    courses: {},
    payments: {},
    tokens: {}
  });
  const [dateRange, setDateRange] = useState('month');
  const [department, setDepartment] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, department]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all analytics data
      const [usersRes, projectsRes, skillsRes, coursesRes, paymentsRes, tokensRes] = await Promise.all([
        fetch('/api/analytics/users', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
        fetch('/api/analytics/projects', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
        fetch('/api/analytics/skills', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
        fetch('/api/analytics/courses', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
        fetch('/api/analytics/payments', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
        fetch('/api/analytics/tokens', { headers: { 'x-auth-token': localStorage.getItem('token') } })
      ]);

      const [users, projects, skills, courses, payments, tokens] = await Promise.all([
        usersRes.json(),
        projectsRes.json(),
        skillsRes.json(),
        coursesRes.json(),
        paymentsRes.json(),
        tokensRes.json()
      ]);

      setStats({
        users: users.data || {},
        projects: projects.data || {},
        skills: skills.data || {},
        courses: courses.data || {},
        payments: payments.data || {},
        tokens: tokens.data || {}
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
    setLoading(false);
  };

  // Chart configurations
  const skillDistributionChart = {
    labels: stats.skills.distribution?.map(s => s.skill) || [],
    datasets: [{
      label: 'Number of Users',
      data: stats.skills.distribution?.map(s => s.userCount) || [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  const monthlyTrendChart = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Course Completions',
        data: [12, 19, 23, 25, 32, 45, 52, 48, 61, 67, 72, 78],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      },
      {
        label: 'Projects Completed',
        data: [8, 12, 15, 17, 22, 28, 32, 35, 38, 42, 45, 48],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4
      }
    ]
  };

  const departmentPerformanceChart = {
    labels: ['Technical Skills', 'Communication', 'Leadership', 'Project Management', 'Innovation'],
    datasets: [
      {
        label: 'Engineering',
        data: [85, 70, 65, 80, 90],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        label: 'Marketing',
        data: [65, 90, 85, 75, 70],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: 'Sales',
        data: [70, 85, 90, 85, 65],
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
      }
    ]
  };

  const revenueChart = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue ($)',
      data: [12500, 18700, 24300, 31200],
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1
    }]
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`rounded-lg p-3 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          {change && (
            <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into workforce development and performance</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">Human Resources</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users.total || 0}
          change={12}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Projects"
          value={stats.projects.active || 0}
          change={8}
          icon={FolderOpen}
          color="bg-green-500"
        />
        <StatCard
          title="Course Completions"
          value={stats.courses.completions || 0}
          change={25}
          icon={BookOpen}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.payments.total || 0}`}
          change={15}
          icon={DollarSign}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Skill Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Skill Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={skillDistributionChart} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { position: 'right' } 
                } 
              }} 
            />
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <div className="h-64">
            <Line 
              data={monthlyTrendChart} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { position: 'top' } 
                } 
              }} 
            />
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
          <div className="h-64">
            <Radar 
              data={departmentPerformanceChart} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quarterly Revenue</h3>
          <div className="h-64">
            <Bar 
              data={revenueChart} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false } 
                } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badges
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Jane Smith
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    98.5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    12
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    John Doe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    95.2
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    10
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Alice Brown
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    94.8
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    11
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Critical Skill Gaps</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Cloud Architecture</span>
                <span className="text-sm text-gray-500">23% gap</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '77%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Data Analytics</span>
                <span className="text-sm text-gray-500">18% gap</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Project Management</span>
                <span className="text-sm text-gray-500">12% gap</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Machine Learning</span>
                <span className="text-sm text-gray-500">31% gap</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '69%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;