import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import pdfExportService from '../services/pdfExportService';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
import { Download, Calendar, Filter, RefreshCw, FileText, Users, FolderOpen, Award, DollarSign, Coins, Star } from 'lucide-react';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: null,
    projects: null,
    skills: null,
    courses: null,
    payments: null,
    tokens: null,
    badges: null,
    comprehensiveReport: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, projects, skills, courses, payments, tokens, badges] = await Promise.all([
        analyticsAPI.getUserStats(),
        analyticsAPI.getProjectStats(),
        analyticsAPI.getSkillDistribution(),
        analyticsAPI.getCourseStats(),
        analyticsAPI.getPaymentStats(),
        analyticsAPI.getTokenStats(),
        analyticsAPI.getBadgeStats()
      ]);

      setAnalyticsData({
        users: users.data.data,
        projects: projects.data.data,
        skills: skills.data.data,
        courses: courses.data.data,
        payments: payments.data.data,
        tokens: tokens.data.data,
        badges: badges.data.data
      });
    } catch (err) {
      console.error('Analytics loading error:', err);
      setError('Failed to load analytics data');
    }
    setLoading(false);
  };

  const loadComprehensiveReport = async () => {
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      const response = await analyticsAPI.getComprehensiveReport(params);
      setAnalyticsData(prev => ({
        ...prev,
        comprehensiveReport: response.data.data
      }));
    } catch (err) {
      console.error('Comprehensive report loading error:', err);
      setError('Failed to load comprehensive report');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAnalytics();
    if (activeTab === 'comprehensive') {
      await loadComprehensiveReport();
    }
    setRefreshing(false);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyDateFilter = () => {
    if (activeTab === 'comprehensive') {
      loadComprehensiveReport();
    }
  };

  const exportToPDF = async (reportType, data, filename) => {
    setExportLoading(true);
    try {
      console.log(`Exporting ${reportType} report with data:`, data);
      
      let report;
      
      switch (reportType) {
        case 'users':
          report = pdfExportService.generateUserAnalyticsReport(data);
          break;
        case 'projects':
          report = pdfExportService.generateProjectAnalyticsReport(data);
          break;
        case 'courses':
          report = pdfExportService.generateCourseAnalyticsReport(data);
          break;
        case 'skills':
          report = pdfExportService.generateSkillAnalyticsReport(data);
          break;
        case 'payments':
          report = pdfExportService.generatePaymentAnalyticsReport(data);
          break;
        case 'tokens':
          report = pdfExportService.generateTokenAnalyticsReport(data);
          break;
        case 'badges':
          report = pdfExportService.generateBadgeAnalyticsReport(data);
          break;
        case 'comprehensive':
          report = pdfExportService.generateComprehensiveReport(data);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      report.save(filename);
      console.log(`${reportType} report exported successfully`);
    } catch (err) {
      console.error('PDF export error:', err);
      setError(`Failed to export PDF: ${err.message}`);
    }
    setExportLoading(false);
  };

  const getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  });

  const MetricCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 mr-4`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );

  const ExportButton = ({ onClick, loading, children, variant = 'primary' }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50'
      }`}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {children}
    </button>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'courses', label: 'Courses', icon: Award },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'comprehensive', label: 'Full Report', icon: FileText }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'comprehensive' && !analyticsData.comprehensiveReport) {
      loadComprehensiveReport();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights and exportable reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {activeTab === 'comprehensive' && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                />
                <button
                  onClick={handleApplyDateFilter}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={handleTabChange}
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={analyticsData.users?.totalUsers || 0}
              icon={Users}
              color="bg-blue-500"
              description={`${analyticsData.users?.activeUsers || 0} active`}
            />
            <MetricCard
              title="Active Projects"
              value={analyticsData.projects?.activeProjects || 0}
              icon={FolderOpen}
              color="bg-green-500"
              description={`${analyticsData.projects?.completedProjects || 0} completed`}
            />
            <MetricCard
              title="Course Enrollments"
              value={analyticsData.courses?.totalEnrollments || 0}
              icon={Award}
              color="bg-purple-500"
              description={`${analyticsData.courses?.completionRate || 0}% completion rate`}
            />
            <MetricCard
              title="Total Revenue"
              value={`$${analyticsData.payments?.totalAmount || '0.00'}`}
              icon={DollarSign}
              color="bg-yellow-500"
              description={`${analyticsData.payments?.successRate || 0}% success rate`}
            />
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.users?.usersByDepartment && analyticsData.users.usersByDepartment.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Pie
                  data={{
                    labels: analyticsData.users.usersByDepartment.map(d => d.department || 'Unknown'),
                    datasets: [{
                      data: analyticsData.users.usersByDepartment.map(d => d.count),
                      backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
                        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
                      ]
                    }]
                  }}
                  options={getChartOptions('Users by Department')}
                />
              </div>
            )}

            {analyticsData.projects?.projectsByStatus && analyticsData.projects.projectsByStatus.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Bar
                  data={{
                    labels: analyticsData.projects.projectsByStatus.map(p => p.status),
                    datasets: [{
                      label: 'Projects',
                      data: analyticsData.projects.projectsByStatus.map(p => p.count),
                      backgroundColor: '#3B82F6'
                    }]
                  }}
                  options={getChartOptions('Projects by Status')}
                />
              </div>
            )}
          </div>

          {/* Export All Reports */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ExportButton
                onClick={() => exportToPDF('users', analyticsData.users, 'user-analytics-report.pdf')}
                loading={exportLoading}
              >
                User Report
              </ExportButton>
              <ExportButton
                onClick={() => exportToPDF('projects', analyticsData.projects, 'project-analytics-report.pdf')}
                loading={exportLoading}
              >
                Project Report
              </ExportButton>
              <ExportButton
                onClick={() => exportToPDF('courses', analyticsData.courses, 'course-analytics-report.pdf')}
                loading={exportLoading}
              >
                Course Report
              </ExportButton>
              <ExportButton
                onClick={() => exportToPDF('payments', analyticsData.payments, 'payment-analytics-report.pdf')}
                loading={exportLoading}
              >
                Payment Report
              </ExportButton>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && analyticsData.users && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Analytics</h2>
            <ExportButton
              onClick={() => exportToPDF('users', analyticsData.users, 'user-analytics-report.pdf')}
              loading={exportLoading}
            >
              Export User Report
            </ExportButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Users"
              value={analyticsData.users.totalUsers}
              icon={Users}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Users"
              value={analyticsData.users.activeUsers}
              icon={Users}
              color="bg-green-500"
            />
            <MetricCard
              title="Activation Rate"
              value={`${analyticsData.users.totalUsers ? ((analyticsData.users.activeUsers / analyticsData.users.totalUsers) * 100).toFixed(1) : 0}%`}
              icon={Users}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.users.usersByDepartment && analyticsData.users.usersByDepartment.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Pie
                  data={{
                    labels: analyticsData.users.usersByDepartment.map(d => d.department || 'Unknown'),
                    datasets: [{
                      data: analyticsData.users.usersByDepartment.map(d => d.count),
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                    }]
                  }}
                  options={getChartOptions('Users by Department')}
                />
              </div>
            )}

            {analyticsData.users.usersByRole && analyticsData.users.usersByRole.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Bar
                  data={{
                    labels: analyticsData.users.usersByRole.map(r => r.role),
                    datasets: [{
                      label: 'Users',
                      data: analyticsData.users.usersByRole.map(r => r.count),
                      backgroundColor: '#10B981'
                    }]
                  }}
                  options={getChartOptions('Users by Role')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && analyticsData.projects && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Project Analytics</h2>
            <ExportButton
              onClick={() => exportToPDF('projects', analyticsData.projects, 'project-analytics-report.pdf')}
              loading={exportLoading}
            >
              Export Project Report
            </ExportButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Projects"
              value={analyticsData.projects.totalProjects}
              icon={FolderOpen}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Projects"
              value={analyticsData.projects.activeProjects}
              icon={FolderOpen}
              color="bg-green-500"
            />
            <MetricCard
              title="Completed Projects"
              value={analyticsData.projects.completedProjects}
              icon={FolderOpen}
              color="bg-purple-500"
            />
            <MetricCard
              title="Completion Rate"
              value={`${analyticsData.projects.totalProjects ? ((analyticsData.projects.completedProjects / analyticsData.projects.totalProjects) * 100).toFixed(1) : 0}%`}
              icon={FolderOpen}
              color="bg-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.projects.projectsByStatus && analyticsData.projects.projectsByStatus.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Bar
                  data={{
                    labels: analyticsData.projects.projectsByStatus.map(p => p.status),
                    datasets: [{
                      label: 'Projects',
                      data: analyticsData.projects.projectsByStatus.map(p => p.count),
                      backgroundColor: '#3B82F6'
                    }]
                  }}
                  options={getChartOptions('Projects by Status')}
                />
              </div>
            )}

            {analyticsData.projects.projectsByPriority && analyticsData.projects.projectsByPriority.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Pie
                  data={{
                    labels: analyticsData.projects.projectsByPriority.map(p => p.priority),
                    datasets: [{
                      data: analyticsData.projects.projectsByPriority.map(p => p.count),
                      backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6']
                    }]
                  }}
                  options={getChartOptions('Projects by Priority')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'courses' && analyticsData.courses && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Course Analytics</h2>
            <ExportButton
              onClick={() => exportToPDF('courses', analyticsData.courses, 'course-analytics-report.pdf')}
              loading={exportLoading}
            >
              Export Course Report
            </ExportButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Courses"
              value={analyticsData.courses.totalCourses}
              icon={Award}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Courses"
              value={analyticsData.courses.activeCourses}
              icon={Award}
              color="bg-green-500"
            />
            <MetricCard
              title="Total Enrollments"
              value={analyticsData.courses.totalEnrollments}
              icon={Award}
              color="bg-purple-500"
            />
            <MetricCard
              title="Completion Rate"
              value={`${analyticsData.courses.completionRate}%`}
              icon={Award}
              color="bg-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.courses.coursesByCategory && analyticsData.courses.coursesByCategory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Pie
                  data={{
                    labels: analyticsData.courses.coursesByCategory.map(c => c.category),
                    datasets: [{
                      data: analyticsData.courses.coursesByCategory.map(c => c.count),
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                    }]
                  }}
                  options={getChartOptions('Courses by Category')}
                />
              </div>
            )}

            {analyticsData.courses.popularCourses && analyticsData.courses.popularCourses.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Bar
                  data={{
                    labels: analyticsData.courses.popularCourses.slice(0, 5).map(c => 
                      (c['Course.title'] || 'Unknown').substring(0, 20) + '...'
                    ),
                    datasets: [{
                      label: 'Enrollments',
                      data: analyticsData.courses.popularCourses.slice(0, 5).map(c => c.enrollment_count),
                      backgroundColor: '#8B5CF6'
                    }]
                  }}
                  options={getChartOptions('Most Popular Courses')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'skills' && analyticsData.skills && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Skill Analytics</h2>
            <ExportButton
              onClick={() => exportToPDF('skills', analyticsData.skills, 'skill-analytics-report.pdf')}
              loading={exportLoading}
            >
              Export Skill Report
            </ExportButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.skills.skillsByCategory && analyticsData.skills.skillsByCategory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Pie
                  data={{
                    labels: analyticsData.skills.skillsByCategory.map(s => s.category),
                    datasets: [{
                      data: analyticsData.skills.skillsByCategory.map(s => s.count),
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
                    }]
                  }}
                  options={getChartOptions('Skills by Category')}
                />
              </div>
            )}

            {analyticsData.skills.topSkills && analyticsData.skills.topSkills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Bar
                  data={{
                    labels: analyticsData.skills.topSkills.slice(0, 10).map(s => s['Skill.name'] || 'Unknown'),
                    datasets: [{
                      label: 'Users with Skill',
                      data: analyticsData.skills.topSkills.slice(0, 10).map(s => s.user_count),
                      backgroundColor: '#10B981'
                    }]
                  }}
                  options={getChartOptions('Most Popular Skills')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && analyticsData.payments && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Payment Analytics</h2>
            <ExportButton
              onClick={() => exportToPDF('payments', analyticsData.payments, 'payment-analytics-report.pdf')}
              loading={exportLoading}
            >
              Export Payment Report
            </ExportButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Payments"
              value={analyticsData.payments.totalPayments}
              icon={DollarSign}
              color="bg-blue-500"
            />
            <MetricCard
              title="Successful Payments"
              value={analyticsData.payments.successfulPayments}
              icon={DollarSign}
              color="bg-green-500"
            />
            <MetricCard
              title="Total Amount"
              value={`${analyticsData.payments.totalAmount}`}
              icon={DollarSign}
              color="bg-purple-500"
            />
            <MetricCard
              title="Success Rate"
              value={`${analyticsData.payments.successRate}%`}
              icon={DollarSign}
              color="bg-yellow-500"
            />
          </div>

          {analyticsData.payments.paymentsByStatus && analyticsData.payments.paymentsByStatus.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <Pie
                data={{
                  labels: analyticsData.payments.paymentsByStatus.map(p => p.status),
                  datasets: [{
                    data: analyticsData.payments.paymentsByStatus.map(p => p.count),
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280']
                  }]
                }}
                options={getChartOptions('Payments by Status')}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'tokens' && analyticsData.tokens && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Token Analytics</h2>
            <ExportButton
              onClick={() => exportToPDF('tokens', analyticsData.tokens, 'token-analytics-report.pdf')}
              loading={exportLoading}
            >
              Export Token Report
            </ExportButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Transactions"
              value={analyticsData.tokens.totalTransactions}
              icon={Coins}
              color="bg-blue-500"
            />
            <MetricCard
              title="Tokens Earned"
              value={analyticsData.tokens.totalTokensEarned}
              icon={Coins}
              color="bg-green-500"
            />
            <MetricCard
              title="Tokens Spent"
              value={Math.abs(analyticsData.tokens.totalTokensSpent)}
              icon={Coins}
              color="bg-red-500"
            />
            <MetricCard
              title="Net Tokens"
              value={analyticsData.tokens.netTokens}
              icon={Coins}
              color="bg-purple-500"
            />
          </div>

          {analyticsData.tokens.tokensByType && analyticsData.tokens.tokensByType.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <Bar
                data={{
                  labels: analyticsData.tokens.tokensByType.map(t => t.transaction_type),
                  datasets: [{
                    label: 'Tokens',
                    data: analyticsData.tokens.tokensByType.map(t => Math.abs(t.total)),
                    backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6']
                  }]
                }}
                options={getChartOptions('Tokens by Transaction Type')}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && analyticsData.badges && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Badge Analytics</h2>
            <ExportButton
              onClick={() => exportToPDF('badges', analyticsData.badges, 'badge-analytics-report.pdf')}
              loading={exportLoading}
            >
              Export Badge Report
            </ExportButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Badges"
              value={analyticsData.badges.totalBadges}
              icon={Award}
              color="bg-blue-500"
            />
            <MetricCard
              title="Total Awarded"
              value={analyticsData.badges.totalAwarded}
              icon={Award}
              color="bg-green-500"
            />
            <MetricCard
              title="Award Rate"
              value={`${analyticsData.badges.totalBadges ? ((analyticsData.badges.totalAwarded / analyticsData.badges.totalBadges) * 100).toFixed(1) : 0}%`}
              icon={Award}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.badges.badgesByRarity && analyticsData.badges.badgesByRarity.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Pie
                  data={{
                    labels: analyticsData.badges.badgesByRarity.map(b => b.rarity),
                    datasets: [{
                      data: analyticsData.badges.badgesByRarity.map(b => b.count),
                      backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
                    }]
                  }}
                  options={getChartOptions('Badges by Rarity')}
                />
              </div>
            )}

            {analyticsData.badges.popularBadges && analyticsData.badges.popularBadges.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <Bar
                  data={{
                    labels: analyticsData.badges.popularBadges.slice(0, 5).map(b => 
                      (b['Badge.name'] || 'Unknown').substring(0, 15) + '...'
                    ),
                    datasets: [{
                      label: 'Times Awarded',
                      data: analyticsData.badges.popularBadges.slice(0, 5).map(b => b.awarded_count),
                      backgroundColor: '#F59E0B'
                    }]
                  }}
                  options={getChartOptions('Most Awarded Badges')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'comprehensive' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Comprehensive Report</h2>
            <ExportButton
              onClick={() => exportToPDF('comprehensive', analyticsData.comprehensiveReport, 
                `comprehensive-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`)}
              loading={exportLoading}
              disabled={!analyticsData.comprehensiveReport}
            >
              Export Full Report
            </ExportButton>
          </div>

          {analyticsData.comprehensiveReport ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analyticsData.comprehensiveReport.userGrowth && analyticsData.comprehensiveReport.userGrowth.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <Line
                    data={{
                      labels: analyticsData.comprehensiveReport.userGrowth.map(u => 
                        new Date(u.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      ),
                      datasets: [{
                        label: 'New Users',
                        data: analyticsData.comprehensiveReport.userGrowth.map(u => u.count),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                      }]
                    }}
                    options={getChartOptions('User Growth Trend')}
                  />
                </div>
              )}

              {analyticsData.comprehensiveReport.courseCompletions && analyticsData.comprehensiveReport.courseCompletions.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <Line
                    data={{
                      labels: analyticsData.comprehensiveReport.courseCompletions.map(c => 
                        new Date(c.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      ),
                      datasets: [{
                        label: 'Course Completions',
                        data: analyticsData.comprehensiveReport.courseCompletions.map(c => c.count),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                      }]
                    }}
                    options={getChartOptions('Course Completion Trend')}
                  />
                </div>
              )}

              {analyticsData.comprehensiveReport.tokenEarnings && analyticsData.comprehensiveReport.tokenEarnings.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <Line
                    data={{
                      labels: analyticsData.comprehensiveReport.tokenEarnings.map(t => 
                        new Date(t.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      ),
                      datasets: [{
                        label: 'Tokens Earned',
                        data: analyticsData.comprehensiveReport.tokenEarnings.map(t => t.total),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4
                      }]
                    }}
                    options={getChartOptions('Token Earning Trend')}
                  />
                </div>
              )}

              {analyticsData.comprehensiveReport.departmentPerformance && analyticsData.comprehensiveReport.departmentPerformance.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <Bar
                    data={{
                      labels: analyticsData.comprehensiveReport.departmentPerformance.map(d => d.department),
                      datasets: [{
                        label: 'Active Users',
                        data: analyticsData.comprehensiveReport.departmentPerformance.map(d => d.user_count),
                        backgroundColor: '#8B5CF6'
                      }]
                    }}
                    options={getChartOptions('Department Performance')}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Loading comprehensive report data...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;