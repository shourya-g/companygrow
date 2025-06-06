import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { coursesAPI } from '../services/api';

const CourseRecommendations = ({ limit = 6, showTitle = true }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const authUser = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      loadRecommendations();
    } else {
      setLoading(false);
    }
  }, [authUser]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await coursesAPI.getRecommendations();
      setRecommendations(Array.isArray(res.data.data) ? res.data.data.slice(0, limit) : []);
    } catch (err) {
      setError('Failed to load recommendations');
      setRecommendations([]);
    }
    setLoading(false);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (!authUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTitle && (
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Recommended for You
          </h2>
        )}
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTitle && (
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Recommended for You
          </h2>
        )}
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            {error || "No recommendations available yet. Complete your profile and enroll in courses to get personalized suggestions."}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Recommended for You
          </h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center text-sm"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(course => (
          <div 
            key={course.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            {/* Course Header */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                  {course.difficulty_level}
                </span>
                {course.relevance_score > 0 && (
                  <div className="flex items-center">
                    <TrendingUp className={`w-4 h-4 mr-1 ${getRelevanceColor(course.relevance_score)}`} />
                    <span className={`text-xs font-medium ${getRelevanceColor(course.relevance_score)}`}>
                      {course.relevance_score}/10
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                {course.title}
              </h3>
              
              <p className="text-xs text-gray-600 mb-2">{course.category}</p>
              
              {course.recommendation_reason && (
                <p className="text-xs text-blue-600 italic">
                  {course.recommendation_reason}
                </p>
              )}
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>{course.duration_hours || 0}h</span>
              </div>
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>{course.enrollment_count || 0}</span>
              </div>
              {course.completion_rate !== undefined && (
                <div className="flex items-center col-span-2">
                  <Star className="w-3 h-3 mr-1" />
                  <span>{course.completion_rate}% completion rate</span>
                </div>
              )}
            </div>

            {/* Skills Preview */}
            {course.Skills && course.Skills.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {course.Skills.slice(0, 2).map(skill => (
                    <span 
                      key={skill.id}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {course.Skills.length > 2 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                      +{course.Skills.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action */}
            <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors">
              View Course
            </button>
          </div>
        ))}
      </div>

      {recommendations.length === limit && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center mx-auto"
          >
            See More Recommendations
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseRecommendations;