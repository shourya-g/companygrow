import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  Award, 
  Play,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Target,
  TrendingUp
} from 'lucide-react';
import { coursesAPI } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      try {
        const enrollmentAPI = await import('../services/api').then(m => m.courseEnrollmentsAPI);
        const res = await enrollmentAPI.getUserEnrollments(user.id);
        if (res.data && Array.isArray(res.data.data)) {
          setEnrolledCourses(res.data.data.map(e => e.course_id));
        }
      } catch (e) {
        // ignore
      }
    }
    fetchEnrollments();
  }, [user]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await coursesAPI.getById(id, { include_enrollments: true });
      if (response.data.success) {
        setCourse(response.data.data);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Load course error:', err);
      if (err.response?.status === 404) {
        setError('Course not found');
      } else {
        setError('Failed to load course details');
      }
    }
    
    setLoading(false);
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrollingId(courseId);
    setEnrollmentError(null);
    try {
      const enrollmentAPI = await import('../services/api').then(m => m.courseEnrollmentsAPI);
      const response = await enrollmentAPI.enroll({ course_id: courseId, user_id: user.id });
      if (response.data.success) {
        setEnrolledCourses([...enrolledCourses, courseId]);
        loadCourse(); // Optionally reload course details
      }
    } catch (err) {
      setEnrollmentError(err.response?.data?.error?.message || 'Failed to enroll in course');
    }
    setEnrollingId(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnrollmentStatus = () => {
    if (!course.user_enrollment) return 'not_enrolled';
    return course.user_enrollment.status;
  };

  const getEnrollmentProgress = () => {
    if (!course.user_enrollment) return 0;
    return course.user_enrollment.progress_percentage || 0;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-600">{error}</div>
        </div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>
    );
  }
  if (!course) return null;
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-6">
          <div className="flex-shrink-0 w-full md:w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 md:mb-0">
            {course.course_image ? (
              <img src={course.course_image} alt={course.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <BookOpen className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                {course.difficulty_level || 'N/A'}
              </span>
              {course.price > 0 && (
                <span className="bg-gray-200 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                  ${course.price}
                </span>
              )}
            </div>
            <div className="text-gray-600 mb-2">{course.category}</div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
              <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{course.duration_hours || 0}h</div>
              <div className="flex items-center"><Users className="w-4 h-4 mr-1" />{course.stats?.total_enrollments || 0}</div>
              {course.stats?.avg_progress > 0 && (
                <div className="flex items-center"><Star className="w-4 h-4 mr-1" />{course.stats.avg_progress}%</div>
              )}
            </div>
            {course.instructor_name && (
              <div className="text-sm text-gray-600 mb-2">Instructor: {course.instructor_name}</div>
            )}
            {course.Skills && course.Skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {course.Skills.map(skill => (
                  <span key={skill.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{skill.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Learning Objectives</h3>
          <ul className="list-disc pl-6 text-gray-700">
            {(course.learning_objectives && course.learning_objectives.length > 0 ? course.learning_objectives : ['No objectives listed']).map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Course Materials</h3>
          <ul className="list-disc pl-6 text-gray-700">
            {(course.course_materials && course.course_materials.length > 0 ? course.course_materials : ['No materials listed']).map((mat, idx) => (
              <li key={idx}>{mat}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Prerequisites</h3>
          <p className="text-gray-700">{course.prerequisites || 'None'}</p>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Enrollment</h3>
          <div className="flex justify-between items-center">
            {enrolledCourses.includes(course.id) ? (
              <span className="text-green-700 font-medium flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-1" />Enrolled</span>
            ) : (
              <button
                onClick={() => handleEnroll(course.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                disabled={enrollingId !== null}
              >
                {enrollingId === course.id ? 'Enrolling...' : 'Enroll'}
              </button>
            )}
          </div>
          {enrollmentError && (
            <div className="text-red-600 mt-2">{enrollmentError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;