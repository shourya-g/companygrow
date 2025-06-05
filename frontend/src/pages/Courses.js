import React, { useEffect, useState, useCallback } from 'react';
import { fetchCourses, createCourse, deleteCourse } from '../services/api';
import { useSelector } from 'react-redux';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const authUser = useSelector(state => state.auth.user);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCourses();
      // Show ALL active courses to users, not just ones they created
      let filtered = Array.isArray(res.data.data) ? res.data.data : [];
      
      // Only filter if the user is not an admin/manager AND we want to show only their created courses
      // For a learning platform, users should see all available courses
      // Remove this filtering to show all courses:
      // if (authUser && authUser.id && !['admin', 'manager'].includes(authUser.role)) {
      //   filtered = filtered.filter(c => c.created_by === authUser.id);
      // }
      
      setCourses(filtered);
    } catch (err) {
      setError('Failed to load courses');
      setCourses([]);
    }
    setLoading(false);
  }, []); // Remove authUser dependency since we're not using it in the function

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleInputChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createCourse({ ...newCourse, created_by: authUser?.id });
      setNewCourse({ title: '', description: '' });
      loadCourses();
    } catch (err) {
      setError('Failed to create course');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    setError(null);
    try {
      await deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  // Check if user can create courses (admin/manager only)
  const canCreateCourses = authUser && ['admin', 'manager'].includes(authUser.role);

  // Check if user can delete a specific course
  const canDeleteCourse = (course) => {
    if (!authUser) return false;
    return authUser.role === 'admin' || 
           (authUser.role === 'manager' && course.created_by === authUser.id) ||
           course.created_by === authUser.id;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600 mt-2">
          {canCreateCourses ? 'Browse and manage courses below.' : 'Browse available courses below.'}
        </p>
      </div>

      {/* Only show course creation form to admin/managers */}
      {canCreateCourses && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Course</h2>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-gray-700">Title</label>
              <input 
                name="title" 
                value={newCourse.title} 
                onChange={handleInputChange} 
                required 
                className="border rounded px-3 py-2 w-full" 
                placeholder="Enter course title"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">Description</label>
              <input 
                name="description" 
                value={newCourse.description} 
                onChange={handleInputChange} 
                className="border rounded px-3 py-2 w-full" 
                placeholder="Enter course description"
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors" 
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Add Course'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="text-red-600 mb-4 bg-red-50 p-3 rounded">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No courses available yet.</p>
              {canCreateCourses && (
                <p className="text-gray-400">Create the first course using the form above.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.category && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {course.category}
                        </span>
                      )}
                      {course.difficulty_level && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {course.difficulty_level}
                        </span>
                      )}
                      {course.duration_hours && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {course.duration_hours}h
                        </span>
                      )}
                    </div>

                    {course.instructor_name && (
                      <p className="text-gray-500 text-sm">
                        Instructor: {course.instructor_name}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm">
                      Enroll
                    </button>
                    
                    {canDeleteCourse(course) && (
                      <button 
                        onClick={() => handleDelete(course.id)} 
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;