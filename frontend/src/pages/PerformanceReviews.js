import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Trophy,
  TrendingUp,
  Users,
  Star,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Plus,
  X as CloseIcon,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const PerformanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: 'all',
  });

  const authUser = useSelector((state) => state.auth.user);
  const isManager = authUser?.role === 'manager' || authUser?.role === 'admin';

  useEffect(() => {
    loadReviews();
    if (isManager) {
      loadPerformanceStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isManager]);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateRange !== 'all') {
        const dates = getDateRange(filters.dateRange);
        queryParams.append('start_date', dates.start);
        queryParams.append('end_date', dates.end);
      }

      const response = await fetch(`/api/performanceReviews?${queryParams}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.data);
    } catch (err) {
      setError('Failed to load performance reviews');
    }
    setLoading(false);
  };

  const loadPerformanceStats = async () => {
    try {
      const response = await fetch('/api/performanceReviews/report', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setPerformanceStats(data.data);
    } catch (err) {
      console.error('Failed to load performance stats:', err);
    }
  };

  const loadEmployeeHistory = async (employeeId) => {
    try {
      const response = await fetch(
        `/api/performanceReviews/employee/${employeeId}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setEmployeeHistory(data.data);
    } catch (err) {
      console.error('Failed to load employee history:', err);
    }
  };

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setFullYear(2020);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const handleCreateReview = async (reviewData) => {
    try {
      const response = await fetch('/api/performanceReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) throw new Error('Failed to create review');

      setShowCreateModal(false);
      loadReviews();
    } catch (err) {
      alert('Failed to create review: ' + err.message);
    }
  };

  const handleSubmitReview = async (reviewId) => {
    try {
      const response = await fetch(
        `/api/performanceReviews/${reviewId}/submit`,
        {
          method: 'PUT',
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );

      if (!response.ok) throw new Error('Failed to submit review');

      loadReviews();
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      const response = await fetch(
        `/api/performanceReviews/${reviewId}/approve`,
        {
          method: 'PUT',
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );

      if (!response.ok) throw new Error('Failed to approve review');

      loadReviews();
      alert('Review approved successfully!');
    } catch (err) {
      alert('Failed to approve review: ' + err.message);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Performance Review Report', 14, 20);

    // Date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Stats summary
    if (performanceStats?.stats) {
      doc.setFontSize(14);
      doc.text('Performance Summary', 14, 45);

      doc.setFontSize(10);
      doc.text(
        `Total Reviews: ${performanceStats.stats.totalReviews}`,
        14,
        55
      );
      doc.text(
        `Average Overall Rating: ${performanceStats.stats.averageRatings.overall}`,
        14,
        62
      );
      doc.text(
        `Average Technical Rating: ${performanceStats.stats.averageRatings.technical}`,
        14,
        69
      );
      doc.text(
        `Average Communication Rating: ${performanceStats.stats.averageRatings.communication}`,
        14,
        76
      );
      doc.text(
        `Average Teamwork Rating: ${performanceStats.stats.averageRatings.teamwork}`,
        14,
        83
      );
      doc.text(
        `Average Leadership Rating: ${performanceStats.stats.averageRatings.leadership}`,
        14,
        90
      );
    }

    // Reviews table
    const tableData = reviews.map((review) => [
      `${review.employee.first_name} ${review.employee.last_name}`,
      review.employee.department,
      review.overall_rating || 'N/A',
      review.status,
      new Date(review.review_period_end).toLocaleDateString(),
    ]);

    doc.autoTable({
      startY: 100,
      head: [['Employee', 'Department', 'Overall Rating', 'Status', 'Period End']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
    });

    // Save the PDF
    doc.save('performance_reviews_report.pdf');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      submitted: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: Trophy },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  // Chart configurations
  const ratingDistributionChart = performanceStats?.stats
    ? {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [
          {
            label: 'Number of Reviews',
            data: Object.values(performanceStats.stats.ratingDistribution),
            backgroundColor: [
              'rgba(239, 68, 68, 0.5)',
              'rgba(251, 146, 60, 0.5)',
              'rgba(251, 191, 36, 0.5)',
              'rgba(59, 130, 246, 0.5)',
              'rgba(16, 185, 129, 0.5)',
            ],
            borderColor: [
              'rgb(239, 68, 68)',
              'rgb(251, 146, 60)',
              'rgb(251, 191, 36)',
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const averageRatingsChart = performanceStats?.stats
    ? {
        labels: ['Overall', 'Technical', 'Communication', 'Teamwork', 'Leadership'],
        datasets: [
          {
            label: 'Average Rating',
            data: Object.values(performanceStats.stats.averageRatings),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
            <p className="text-gray-600 mt-2">
              Track and manage employee performance evaluations
            </p>
          </div>
          <div className="flex gap-2">
            {isManager && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Review
              </button>
            )}
            <button
              onClick={generatePDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Stats (Manager View) */}
      {isManager && performanceStats && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            {ratingDistributionChart && (
              <Doughnut
                data={ratingDistributionChart}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                }}
              />
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Average Ratings</h3>
            {averageRatingsChart && (
              <Bar
                data={averageRatingsChart}
                options={{
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 5,
                    },
                  },
                }}
              />
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            <div className="space-y-3">
              {performanceStats.stats.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy
                      className={`w-5 h-5 mr-2 ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                          ? 'text-gray-400'
                          : index === 2
                          ? 'text-orange-600'
                          : 'text-gray-300'
                      }`}
                    />
                    <span className="text-sm font-medium">{performer.employee}</span>
                  </div>
                  {getRatingStars(performer.rating)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Performance Review Details</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No performance reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviewer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.employee.first_name} {review.employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.employee.department} - {review.employee.position}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(review.review_period_start).toLocaleDateString()} -{' '}
                        {new Date(review.review_period_end).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.overall_rating ? (
                          getRatingStars(review.overall_rating)
                        ) : (
                          <span className="text-gray-400">Not rated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {review.reviewer
                          ? `${review.reviewer.first_name} ${review.reviewer.last_name}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDetailModal(true);
                            loadEmployeeHistory(review.employee_id);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {isManager && review.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitReview(review.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Submit
                          </button>
                        )}
                        {authUser?.role === 'admin' && review.status === 'submitted' && (
                          <button
                            onClick={() => handleApproveReview(review.id)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Review Modal */}
      {showCreateModal && (
        <CreateReviewModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateReview}
        />
      )}

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          history={employeeHistory}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReview(null);
            setEmployeeHistory(null);
          }}
        />
      )}
    </div>
  );
};

export default PerformanceReviews;

/* -------------------------------------------------------------------------- */
/*                          CreateReviewModal Component                       */
/* -------------------------------------------------------------------------- */
const CreateReviewModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    review_period_start: '',
    review_period_end: '',
    overall_rating: '',
    technical_skills_rating: '',
    communication_rating: '',
    teamwork_rating: '',
    leadership_rating: '',
    achievements: '',
    areas_for_improvement: '',
    goals_next_period: '',
    reviewer_comments: '',
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      setEmployees(data.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Create Performance Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee</label>
              <select
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Review Period</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={formData.review_period_start}
                  onChange={(e) =>
                    setFormData({ ...formData, review_period_start: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="mt-2">to</span>
                <input
                  type="date"
                  required
                  value={formData.review_period_end}
                  onChange={(e) =>
                    setFormData({ ...formData, review_period_end: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Rating fields */}
            {['overall', 'technical_skills', 'communication', 'teamwork', 'leadership'].map(
              (field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}{' '}
                    Rating
                  </label>
                  <select
                    value={formData[`${field}_rating`]}
                    onChange={(e) =>
                      setFormData({ ...formData, [`${field}_rating`]: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Rating</option>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>

          {/* Text areas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Achievements</label>
              <textarea
                rows="3"
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Areas for Improvement
              </label>
              <textarea
                rows="3"
                value={formData.areas_for_improvement}
                onChange={(e) =>
                  setFormData({ ...formData, areas_for_improvement: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Goals for Next Period</label>
              <textarea
                rows="3"
                value={formData.goals_next_period}
                onChange={(e) =>
                  setFormData({ ...formData, goals_next_period: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reviewer Comments</label>
              <textarea
                rows="3"
                value={formData.reviewer_comments}
                onChange={(e) =>
                  setFormData({ ...formData, reviewer_comments: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           ReviewDetailModal Component                      */
/* -------------------------------------------------------------------------- */
const ReviewDetailModal = ({ review, history, onClose }) => {
  // Prepare chart data for performance history
  const performanceTrendChart = history?.trends
    ? {
        labels: history.trends.overall.map((t) => t.period),
        datasets: [
          {
            label: 'Overall Rating',
            data: history.trends.overall.map((t) => t.rating),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4,
          },
          {
            label: 'Technical Skills',
            data: history.trends.technical.map((t) => t.rating),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            tension: 0.4,
          },
          {
            label: 'Communication',
            data: history.trends.communication.map((t) => t.rating),
            borderColor: 'rgb(251, 191, 36)',
            backgroundColor: 'rgba(251, 191, 36, 0.5)',
            tension: 0.4,
          },
        ],
      }
    : null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Performance Review Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Employee Information */}
          <div>
            <h4 className="text-md font-semibold mb-3">Employee Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {review.employee.first_name} {review.employee.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{review.employee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{review.employee.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Review Period</p>
                <p className="font-medium">
                  {new Date(review.review_period_start).toLocaleDateString()} -{' '}
                  {new Date(review.review_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div>
            <h4 className="text-md font-semibold mb-3">Performance Ratings</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Rating</span>
                {review.overall_rating ? (
                  getRatingStars(review.overall_rating)
                ) : (
                  <span className="text-gray-400">Not rated</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Technical Skills</span>
                {review.technical_skills_rating ? (
                  getRatingStars(review.technical_skills_rating)
                ) : (
                  <span className="text-gray-400">Not rated</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Communication</span>
                {review.communication_rating ? (
                  getRatingStars(review.communication_rating)
                ) : (
                  <span className="text-gray-400">Not rated</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Teamwork</span>
                {review.teamwork_rating ? (
                  getRatingStars(review.teamwork_rating)
                ) : (
                  <span className="text-gray-400">Not rated</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Leadership</span>
                {review.leadership_rating ? (
                  getRatingStars(review.leadership_rating)
                ) : (
                  <span className="text-gray-400">Not rated</span>
                )}
              </div>
            </div>
          </div>

          {/* Comments and Feedback */}
          <div className="space-y-6">
            {review.achievements && (
              <div>
                <h4 className="text-md font-semibold mb-2">Achievements</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {review.achievements}
                </p>
              </div>
            )}

            {review.areas_for_improvement && (
              <div>
                <h4 className="text-md font-semibold mb-2">Areas for Improvement</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {review.areas_for_improvement}
                </p>
              </div>
            )}

            {review.goals_next_period && (
              <div>
                <h4 className="text-md font-semibold mb-2">Goals for Next Period</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {review.goals_next_period}
                </p>
              </div>
            )}

            {review.reviewer_comments && (
              <div>
                <h4 className="text-md font-semibold mb-2">Reviewer Comments</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {review.reviewer_comments}
                </p>
              </div>
            )}
          </div>

          {/* Performance History Chart */}
          {history && history.trends && history.trends.overall.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3">Performance History</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Line
                  data={performanceTrendChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: {
                        display: true,
                        text: 'Performance Trend Over Time',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                  Average Performance Rating:{' '}
                  <span className="font-semibold">{history.averageRating}</span>
                </p>
              </div>
            </div>
          )}

          {/* Status and Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-gray-500 mr-2">Status:</span>
                {getStatusBadge(review.status)}
              </div>
              <div className="text-gray-500">
                Created on {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
