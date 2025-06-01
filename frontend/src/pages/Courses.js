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
      let filtered = Array.isArray(res.data.data) ? res.data.data : [];
      if (authUser && authUser.id) {
        filtered = filtered.filter(c => c.created_by === authUser.id);
      }
      setCourses(filtered);
    } catch (err) {
      setError('Failed to load courses');
      setCourses([]);
    }
    setLoading(false);
  }, [authUser]);

  useEffect(() => {
    loadCourses();
  }, [authUser, loadCourses]);

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600 mt-2">Browse and manage courses below.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700">Title</label>
            <input name="title" value={newCourse.title} onChange={handleInputChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Description</label>
            <input name="description" value={newCourse.description} onChange={handleInputChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={creating}>
            {creating ? 'Creating...' : 'Add Course'}
          </button>
        </form>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {courses.map(course => (
                <li key={course.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{course.title}</div>
                    <div className="text-gray-600">{course.description}</div>
                  </div>
                  <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;
