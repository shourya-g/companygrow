import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft,
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  DollarSign,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Target,
  User,
  Calendar,
  BarChart3
} from 'lucide-react';
import { coursesAPI } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [progressData, setProgressData] = useState({
    progress_percentage: 0,
    status: 'enrolled'
  });

  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await coursesAPI.getById(id);
      setCourse(res.data.data);
      
      // Set initial progress if enrolled
      if (res.data.data.is_enrolled && res.data.data.CourseEnrollments?.length > 0) {
        const enrollment = res.data.data.CourseEnrollments[0];
        setProgressData({
          progress_percentage: enrollment.progress_percentage || 0,
          status: enrollment.status || 'enrolled'
        });
      }
    } catch (err) {
      setError('Failed to load course details');
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!authUser) {
      alert('Please log in to enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      await coursesAPI.enrollInCourse(id);
      await loadCourse(); // Reload to get updated enrollment status
      alert('Successfully enrolled in course!');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to enroll in course';
      alert(errorMessage);
    }
    setEnrolling(false);
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    setEnrolling(true);
    try {
      await coursesAPI.unenrollFromCourse(id);
      await loadCourse(); // Reload to get updated enrollment status
      alert('Successfully unenrolled from course');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to unenroll from course';
      alert(errorMessage);
    }
    setEnrolling(false);
  };

  const handleProgressUpdate = async () => {
    try {
      await coursesAPI.updateProgress(id, progressData);
      await loadCourse(); // Reload to get updated data
      alert('Progress updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update progress';
      alert(errorMessage);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'enrolled': return 'text-yellow-600';
      case 'dropped': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'in_progress': return <Play className="w-5 h-5" />;
      case 'enrolled': return <BookOpen className="w-5 h-5" />;
      case 'dropped': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {/* Course Image */}
            <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {course.course_image ? (
                <img 
                  src={course.course_image} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <BookOpen className="w-24 h-24" />
                </div>
              )}
              
              {/* Overlay with basic info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                    {course.difficulty_level}
                  </span>
                  {course.is_enrolled && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white ${getStatusColor(course.enrollment_status)} flex items-center gap-1`}>
                      {getStatusIcon(course.enrollment_status)}
                      {course.enrollment_status}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-white/90">{course.category}</p>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Description</h2>
            {course.description ? (
              <p className="text-gray-700 mb-6 leading-relaxed">{course.description}</p>
            ) : (
              <p className="text-gray-500 mb-6 italic">No description available.</p>
            )}

            {/* Learning Objectives */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  {course.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Prerequisites
                </h3>
                <p className="text-gray-700">{course.prerequisites}</p>
              </div>
            )}

            {/* Skills Taught */}
            {course.Skills && course.Skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Skills You'll Develop
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.Skills.map(skill => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium text-blue-900">{skill.name}</span>
                        <p className="text-sm text-blue-700">{skill.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600">Level {skill.CourseSkill?.skill_level || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Info */}
            {course.instructor_name && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Instructor
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{course.instructor_name}</h4>
                  {course.instructor_bio && (
                    <p className="text-gray-700">{course.instructor_bio}</p>
                  )}
                </div>
              </div>
            )}

            {/* Course Materials */}
            {course.course_materials && course.course_materials.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Materials</h3>
                <ul className="space-y-2">
                  {course.course_materials.map((material, index) => (
                    <li key={index} className="flex items-center">
                      <BookOpen className="w-4 h-4 text-gray-500 mr-2" />
                      <a 
                        href={material} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Material {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video URL */}
            {course.video_url && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Video</h3>
                <a 
                  href={course.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Course Video
                </a>
              </div>
            )}
          </div>

          {/* Skill Match Analysis (if user is logged in) */}
          {authUser && course.skill_match && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Skill Match Analysis
              </h2>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Requirements Met: {course.skill_match.met_requirements}/{course.skill_match.total_skills}
                  </span>
                  <span className={`text-sm font-medium ${
                    course.skill_match.recommended ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {course.skill_match.recommended ? 'Recommended' : 'May Need Prerequisites'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      course.skill_match.recommended ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ 
                      width: `${(course.skill_match.met_requirements / course.skill_match.total_skills) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {course.skill_match.skill_analysis.map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{analysis.skill}</span>
                      <p className="text-sm text-gray-600">
                        Required Level: {analysis.required_level} | Your Level: {analysis.user_level}
                      </p>
                    </div>
                    <div>
                      {analysis.meets_requirement ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Course Stats Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">Duration</span>
                </div>
                <span className="font-medium">{course.duration_hours || 0} hours</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">Enrolled</span>
                </div>
                <span className="font-medium">{course.enrollment_count || 0} students</span>
              </div>

              {course.completion_rate !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Completion Rate</span>
                  </div>
                  <span className="font-medium">{course.completion_rate}%</span>
                </div>
              )}

              {course.price > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Price</span>
                  </div>
                  <span className="font-medium text-green-600">${course.price}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">Created</span>
                </div>
                <span className="font-medium">
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Enrollment Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {course.is_enrolled ? (
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Your Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {course.CourseEnrollments?.[0]?.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.CourseEnrollments?.[0]?.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress Update Form */}
                {course.enrollment_status !== 'completed' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Update Progress</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Progress Percentage
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressData.progress_percentage}
                          onChange={(e) => setProgressData(prev => ({
                            ...prev,
                            progress_percentage: parseInt(e.target.value)
                          }))}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-blue-700 mt-1">
                          {progressData.progress_percentage}%
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Status
                        </label>
                        <select
                          value={progressData.status}
                          onChange={(e) => setProgressData(prev => ({
                            ...prev,
                            status: e.target.value
                          }))}
                          className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="enrolled">Enrolled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="dropped">Dropped</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={handleProgressUpdate}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                      >
                        Update Progress
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {course.enrollment_status === 'in_progress' && (
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium">
                      Continue Learning
                    </button>
                  )}
                  
                  <button
                    onClick={handleUnenroll}
                    disabled={enrolling}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    {enrolling ? 'Processing...' : 'Unenroll from Course'}
                  </button>
                </div>

                {/* Enrollment Details */}
                {course.CourseEnrollments?.[0] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Enrollment Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        Enrolled: {new Date(course.CourseEnrollments[0].enrollment_date).toLocaleDateString()}
                      </div>
                      {course.CourseEnrollments[0].completion_date && (
                        <div>
                          Completed: {new Date(course.CourseEnrollments[0].completion_date).toLocaleDateString()}
                        </div>
                      )}
                      {course.CourseEnrollments[0].final_score && (
                        <div>
                          Final Score: {course.CourseEnrollments[0].final_score}%
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !authUser}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-lg mb-4"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </button>

                {!authUser && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                      <span className="text-yellow-700 text-sm">
                        Please log in to enroll in this course.
                      </span>
                    </div>
                  </div>
                )}

                {authUser && course.skill_match && !course.skill_match.recommended && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0" />
                      <span className="text-orange-700 text-sm">
                        You may need to develop some prerequisite skills before taking this course.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Course Creator */}
          {course.creator && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Creator</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {course.creator.first_name} {course.creator.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Course Author</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">More Courses</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/courses')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Browse All Courses</div>
                <div className="text-sm text-gray-600">Explore our full course catalog</div>
              </button>
              
              <button 
                onClick={() => navigate('/courses?category=' + encodeURIComponent(course.category))}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">More {course.category} Courses</div>
                <div className="text-sm text-gray-600">Find similar courses in this category</div>
              </button>
              
              <button 
                onClick={() => navigate('/courses?difficulty_level=' + course.difficulty_level)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">More {course.difficulty_level} Courses</div>
                <div className="text-sm text-gray-600">Find courses at this difficulty level</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;