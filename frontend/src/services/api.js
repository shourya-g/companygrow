import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// PROJECTS API
export const fetchProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// COURSES API
export const fetchCourses = () => api.get('/courses');
export const createCourse = (data) => api.post('/courses', data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// SKILLS API
export const fetchSkills = () => api.get('/skills');
export const createSkill = (data) => api.post('/skills', data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`);

// BADGES API
export const fetchBadges = () => api.get('/badges');
export const createBadge = (data) => api.post('/badges', data);
export const deleteBadge = (id) => api.delete(`/badges/${id}`);

// USERS API
export const fetchUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// NOTIFICATIONS API
export const fetchNotifications = () => api.get('/notifications');

// PAYMENTS API
export const fetchPayments = () => api.get('/payments');

export default api;
