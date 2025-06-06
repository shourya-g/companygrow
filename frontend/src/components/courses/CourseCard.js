import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, BookOpen, Award, DollarSign } from 'lucide-react';

const CourseCard = ({ course, isEnrolled, onEnroll }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    if (onEnroll) {
      onEnroll(course.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {course.course_image && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={course.course_image} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {course.title}
          </h3>
          {course.difficulty_level && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty_level)}`}>
              {course.difficulty_level}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {course.duration_hours || 0} hours
          </div>
          {course.enrollment_count !== undefined && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {course.enrollment_count} enrolled
            </div>
          )}
        </div>

        {course.Skills && course.Skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 mr-1" />
              Skills you'll learn:
            </div>
            <div className="flex flex-wrap gap-1">
              {course.Skills.slice(0, 3).map((skill) => (
                <span
                  key={skill.id}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                >
                  {skill.name}
                </span>
              ))}
              {course.Skills.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{course.Skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            {course.price > 0 ? (
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                {course.price}
              </div>
            ) : (
              <span className="text-green-600 font-semibold">Free</span>
            )}
          </div>

          {isEnrolled ? (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium">
              Enrolled
            </span>
          ) : (
            <button
              onClick={handleEnrollClick}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;