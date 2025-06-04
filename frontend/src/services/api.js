import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.error?.code;
      
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'NO_TOKEN') {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// AUTH API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/verify'),
};

// Legacy auth exports (for backward compatibility)
export const fetchLogin = authAPI.login;
export const fetchRegister = authAPI.register;

// USERS API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getSkills: (userId) => api.get(`/users/${userId}/skills`),
  addSkill: (userId, skillData) => api.post(`/users/${userId}/skills`, skillData),
  updateSkill: (userId, skillId, skillData) => api.put(`/users/${userId}/skills/${skillId}`, skillData),
  deleteSkill: (userId, skillId) => api.delete(`/users/${userId}/skills/${skillId}`),
};

// Legacy user exports
export const fetchUsers = usersAPI.getAll;
export const createUser = (data) => api.post('/users', data); // This might need admin endpoint
export const deleteUser = usersAPI.delete;

// PROJECTS API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Legacy project exports
export const fetchProjects = projectsAPI.getAll;
export const createProject = projectsAPI.create;
export const deleteProject = projectsAPI.delete;

// COURSES API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Legacy course exports
export const fetchCourses = coursesAPI.getAll;
export const createCourse = coursesAPI.create;
export const deleteCourse = coursesAPI.delete;

// SKILLS API
export const skillsAPI = {
  getAll: () => api.get('/skills'),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
};

// Legacy skill exports
export const fetchSkills = skillsAPI.getAll;
export const createSkill = skillsAPI.create;
export const deleteSkill = skillsAPI.delete;

// BADGES API
export const badgesAPI = {
  getAll: () => api.get('/badges'),
  getById: (id) => api.get(`/badges/${id}`),
  create: (data) => api.post('/badges', data),
  update: (id, data) => api.put(`/badges/${id}`, data),
  delete: (id) => api.delete(`/badges/${id}`),
};

// Legacy badge exports
export const fetchBadges = badgesAPI.getAll;
export const createBadge = badgesAPI.create;
export const deleteBadge = badgesAPI.delete;

// NOTIFICATIONS API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Legacy notification exports
export const fetchNotifications = notificationsAPI.getAll;

// PAYMENTS API
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  createPayout: (data) => api.post('/payments/payout', data),
  setupStripeAccount: () => api.post('/payments/setup-stripe'),
};

// Legacy payment exports
export const fetchPayments = paymentsAPI.getAll;
export const createPayout = paymentsAPI.createPayout;

// USER SKILLS API (legacy support)
export const userSkillsAPI = {
  getAll: () => api.get('/userSkills'),
  getById: (id) => api.get(`/userSkills/${id}`),
  create: (data) => api.post('/userSkills', data),
  update: (id, data) => api.put(`/userSkills/${id}`, data),
  delete: (id) => api.delete(`/userSkills/${id}`),
};

// Legacy user skill exports
export const addUserSkill = userSkillsAPI.create;
export const updateUserSkill = userSkillsAPI.update;
export const deleteUserSkill = userSkillsAPI.delete;

// User-centric skill management (recommended)
export const addUserSkillToUser = usersAPI.addSkill;
export const updateUserSkillForUser = usersAPI.updateSkill;
export const deleteUserSkillForUser = usersAPI.deleteSkill;
export const fetchUserSkills = usersAPI.getSkills;

// ANALYTICS API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUserStats: () => api.get('/analytics/users'),
  getProjectStats: () => api.get('/analytics/projects'),
  getSkillDistribution: () => api.get('/analytics/skills'),
  getCourseStats: () => api.get('/analytics/courses'),
  getPaymentStats: () => api.get('/analytics/payments'),
  getTokenStats: () => api.get('/analytics/tokens'),
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.message) {
    return { message: error.message, code: 'NETWORK_ERROR' };
  } else {
    return { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
  }
};

// Token management utilities
export const tokenUtils = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  isTokenValid: async () => {
    try {
      await authAPI.verifyToken();
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default api;