import React, { useState } from 'react';
import { 
  CheckCircle, 
  Play, 
  Clock, 
  Award, 
  TrendingUp,
  AlertCircle,
  Calendar,
  Target
} from 'lucide-react';
import { courseEnrollmentsAPI } from '../services/api';

const CourseProgress = ({ enrollment, course, onProgressUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [newProgress, setNewProgress] = useState(enrollment.progress_percentage || 0);
  const [newStatus, setNewStatus] = useState(enrollment.status || 'enrolled');

  const handleProgressUpdate = async () => {
    setUpdating(true);
    setError(null);

    try {
      const updateData = {
        progress_percentage: Number(newProgress),
        status: newStatus
      };

      const response = await courseEnrollmentsAPI.updateProgress(enrollment.id, updateData);
      
      if (response.data.success) {
        onProgressUpdate(response.data.data);
        setShowProgressForm(false);
      }
    } catch (err) {
      console.error('Update progress error:', err);
      setError(err.response?.data?.error?.message || 'Failed to update progress');
    }

    setUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'enrolled':
        return 'text-yellow-600 bg-yellow-100';
      case 'dropped':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'enrolled':
        return <Clock className="w-4 h-4" />;
      case 'dropped':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const progress = enrollment.progress_percentage || 0;
  const isCompleted = enrollment.status === 'completed';
  const estimatedCompletion = course?.duration_hours && progress > 0 
    ? Math.ceil((course.duration_hours * (100 - progress)) / 100)
    : null;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
            <p className="text-sm text-gray-600">Track your learning journey</p>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
            {getStatusIcon(enrollment.status)}
            <span className="ml-1 capitalize">{enrollment.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : progress > 75 ? 'bg-blue-500' : progress > 50 ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Progress Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{progress}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
          
          {course?.duration_hours && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((course.duration_hours * progress) / 100)}h
              </div>
              <div className="text-xs text-gray-500">Hours Done</div>
            </div>
          )}
          
          {estimatedCompletion && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{estimatedCompletion}h</div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
          )}
          
          {enrollment.final_score && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{enrollment.final_score}%</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-600" />
            Timeline
          </h4>
          
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Enrolled</span>
              <span className="font-medium">{formatDate(enrollment.enrollment_date)}</span>
            </div>
            
            {enrollment.start_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Started</span>
                <span className="font-medium">{formatDate(enrollment.start_date)}</span>
              </div>
            )}
            
            {enrollment.completion_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-green-600">{formatDate(enrollment.completion_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Update Progress Button */}
        {!isCompleted && (
          <div className="border-t pt-4">
            {!showProgressForm ? (
              <button
                onClick={() => setShowProgressForm(true)}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Update Progress
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Percentage
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="font-medium">{newProgress}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleProgressUpdate}
                    disabled={updating}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Save Progress'}
                  </button>
                  <button
                    onClick={() => {
                      setShowProgressForm(false);
                      setNewProgress(enrollment.progress_percentage || 0);
                      setNewStatus(enrollment.status || 'enrolled');
                      setError(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-900 mb-1">Congratulations!</h4>
            <p className="text-sm text-green-700">
              You have successfully completed this course.
            </p>
            {enrollment.final_score && (
              <p className="text-sm text-green-600 mt-1">
                Final Score: {enrollment.final_score}%
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;