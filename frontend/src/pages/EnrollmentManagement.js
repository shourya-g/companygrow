import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { courseEnrollmentsAPI, coursesAPI, usersAPI } from '../services/api';
import { 
  Users, 
  BookOpen, 
  Filter, 
  Search, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Play,
  XCircle,
  Download,
  Edit,
  Trash2
} from 'lucide-react';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [newProgress, setNewProgress] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    if (authUser && ['admin', 'manager'].includes(authUser.role)) {
      loadData();
    }
  }, [authUser]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [enrollmentsRes, coursesRes, usersRes] = await Promise.all([
        courseEnrollmentsAPI.getAll(),
        coursesAPI.getAll(),
        usersAPI.getAll()
      ]);
      
      setEnrollments(Array.isArray(enrollmentsRes.data.data) ? enrollmentsRes.data.data : []);
      setCourses(Array.isArray(coursesRes.data.data) ? coursesRes.data.data : []);
      setUsers(Array.isArray(usersRes.data.data) ? usersRes.data.data : []);
    } catch (err) {
      setError('Failed to load enrollment data');
    }
    setLoading(false);
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = searchTerm ? (
      enrollment.User?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.User?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.User?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.Course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    
    const matchesCourse = selectedCourse ? enrollment.course_id === parseInt(selectedCourse) : true;
    const matchesStatus = selectedStatus ? enrollment.status === selectedStatus : true;
    
    const enrollmentDate = new Date(enrollment.enrollment_date);
    const matchesDateFrom = dateFrom ? enrollmentDate >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? enrollmentDate <= new Date(dateTo) : true;
    
    return matchesSearch && matchesCourse && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleUpdateProgress = async () => {
    if (!selectedEnrollment) return;
    
    setUpdating(true);
    try {
      const updateData = {};
      if (newProgress !== '') updateData.progress_percentage = parseInt(newProgress);
      if (newStatus !== '') updateData.status = newStatus;
      
      await courseEnrollmentsAPI.updateProgress(selectedEnrollment.id, updateData);
      setShowProgressModal(false);
      setSelectedEnrollment(null);
      setNewProgress('');
      setNewStatus('');
      loadData(); // Refresh data
    } catch (err) {
      alert('Failed to update progress: ' + (err.response?.data?.error?.message || err.message));
    }
    setUpdating(false);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;
    
    try {
      await courseEnrollmentsAPI.unenroll(enrollmentId);
      loadData(); // Refresh data
    } catch (err) {
      alert('Failed to delete enrollment: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const openProgressModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setNewProgress(enrollment.progress_percentage || '');
    setNewStatus(enrollment.status || '');
    setShowProgressModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'dropped':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
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

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Course', 'Status', 'Progress', 'Enrollment Date', 'Completion Date'];
    const csvData = filteredEnrollments.map(enrollment => [
      `${enrollment.User?.first_name || ''} ${enrollment.User?.last_name || ''}`.trim(),
      enrollment.User?.email || '',
      enrollment.Course?.title || '',
      enrollment.status || '',
      `${enrollment.progress_percentage || 0}%`,
      new Date(enrollment.enrollment_date).toLocaleDateString(),
      enrollment.completion_date ? new Date(enrollment.completion_date).toLocaleDateString() : ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateStats = () => {
    const total = filteredEnrollments.length;
    const completed = filteredEnrollments.filter(e => e.status === 'completed').length;
    const inProgress = filteredEnrollments.filter(e => e.status === 'in_progress').length;
    const avgProgress = total > 0 ? 
      Math.round(filteredEnrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / total) : 0;
    
    return { total, completed, inProgress, avgProgress };
  };

  const stats = calculateStats();

  if (!authUser || !['admin', 'manager'].includes(authUser.role)) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access enrollment management.</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
        <p className="text-gray-600 mt-2">Manage student enrollments and track progress across all courses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Play className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="enrolled">Enrolled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredEnrollments.length} of {enrollments.length} enrollments
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.map(enrollment => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {enrollment.User?.first_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.User?.first_name} {enrollment.User?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.User?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{enrollment.Course?.title}</div>
                    <div className="text-sm text-gray-500">{enrollment.Course?.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(enrollment.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{enrollment.progress_percentage || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openProgressModal(enrollment)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Update Progress</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student: {selectedEnrollment.User?.first_name} {selectedEnrollment.User?.last_name}
                  </label>
                  <label className="block text-sm text-gray-500">
                    Course: {selectedEnrollment.Course?.title}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter progress percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProgress}
                  disabled={updating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;