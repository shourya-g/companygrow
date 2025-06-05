// Updated API services for course enrollment management
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// ENHANCED COURSES API
export const coursesAPI = {
  // Get all courses with advanced filtering
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/courses?${queryParams.toString()}`);
  },
  
  // Get course categories
  getCategories: () => api.get('/courses/categories'),
  
  // Get popular courses
  getPopular: (limit = 10) => api.get(`/courses/popular?limit=${limit}`),
  
  // Get recommended courses for user
  getRecommended: (limit = 5) => api.get(`/courses/recommended?limit=${limit}`),
  
  // Get course by ID with optional enrollment data
  getById: (id, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return api.get(`/courses/${id}${queryString ? '?' + queryString : ''}`);
  },
  
  // Create new course
  create: (data) => api.post('/courses', data),
  
  // Update course
  update: (id, data) => api.put(`/courses/${id}`, data),
  
  // Delete course
  delete: (id) => api.delete(`/courses/${id}`),
  
  // Toggle course status
  toggleStatus: (id, is_active) => api.patch(`/courses/${id}/status`, { is_active })
};

// COURSE ENROLLMENTS API
export const courseEnrollmentsAPI = {
  // Get all enrollments (admin/manager only)
  getAll: () => api.get('/courseEnrollments'),
  
  // Get enrollment by ID
  getById: (id) => api.get(`/courseEnrollments/${id}`),
  
  // Enroll in course
  enroll: (data) => api.post('/courseEnrollments', data),
  
  // Update course progress
  updateProgress: (id, data) => api.put(`/courseEnrollments/${id}/progress`, data),
  
  // Get enrollments for specific user
  getUserEnrollments: (userId) => api.get(`/courseEnrollments/user/${userId}`),
  
  // Unenroll from course
  unenroll: (id) => api.delete(`/courseEnrollments/${id}`),
  
  // Get user's current enrollments
  getMyEnrollments: () => api.get('/courseEnrollments/user/me')
};

// COURSE SKILLS API
export const courseSkillsAPI = {
  // Get all course skills
  getAll: () => api.get('/courseSkills'),
  
  // Get course skill by ID
  getById: (id) => api.get(`/courseSkills/${id}`),
  
  // Add skill to course
  addToCourse: (data) => api.post('/courseSkills', data),
  
  // Update course skill
  update: (id, data) => api.put(`/courseSkills/${id}`, data),
  
  // Remove skill from course
  removeFromCourse: (id) => api.delete(`/courseSkills/${id}`),
  
  // Get skills for specific course
  getCourseSkills: (courseId) => api.get(`/courseSkills/course/${courseId}`),
  
  // Get courses that teach specific skill
  getSkillCourses: (skillId) => api.get(`/courseSkills/skill/${skillId}`)
};

// ENHANCED SKILLS API
export const skillsAPI = {
  getAll: () => api.get('/skills'),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`)
};

// AUTH API (existing)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/verify'),
};

// USERS API (existing)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getSkills: (userId) => api.get(`/users/${userId}/skills`),
  addSkill: (userId, skillData) => api.post(`/users/${userId}/skills`, skillData),
  updateSkill: (userId, skillId, skillData) => api.put(`/users/${userId}/skills/${skillId}`, skillData),
  deleteSkill: (userId, skillId) => api.delete(`/users/${userId}/skills/${skillId}`),
  getProfile: (userId) => api.get(`/users/${userId}/profile`),
  getDashboard: (userId) => api.get(`/users/${userId}/dashboard`)
};

// PROJECTS API (existing)
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// BADGES API (existing)
export const badgesAPI = {
  getAll: () => api.get('/badges'),
  getById: (id) => api.get(`/badges/${id}`),
  create: (data) => api.post('/badges', data),
  update: (id, data) => api.put(`/badges/${id}`, data),
  delete: (id) => api.delete(`/badges/${id}`),
};

// NOTIFICATIONS API (existing)
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// PAYMENTS API (existing)
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  createPayout: (data) => api.post('/payments/payout', data),
  setupStripeAccount: () => api.post('/payments/setup-stripe'),
};

// ANALYTICS API (existing)
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUserStats: () => api.get('/analytics/users'),
  getProjectStats: () => api.get('/analytics/projects'),
  getSkillDistribution: () => api.get('/analytics/skills'),
  getCourseStats: () => api.get('/analytics/courses'),
  getPaymentStats: () => api.get('/analytics/payments'),
  getTokenStats: () => api.get('/analytics/tokens'),
};

// LEGACY EXPORTS (for backward compatibility)
export const fetchCourses = coursesAPI.getAll;
export const createCourse = coursesAPI.create;
export const deleteCourse = coursesAPI.delete;
export const fetchSkills = skillsAPI.getAll;
export const createSkill = skillsAPI.create;
export const deleteSkill = skillsAPI.delete;
export const fetchProjects = projectsAPI.getAll;
export const createProject = projectsAPI.create;
export const deleteProject = projectsAPI.delete;
export const fetchBadges = badgesAPI.getAll;
export const createBadge = badgesAPI.create;
export const deleteBadge = badgesAPI.delete;
export const fetchNotifications = notificationsAPI.getAll;
export const fetchPayments = paymentsAPI.getAll;
export const createPayout = paymentsAPI.createPayout;
export const fetchUsers = usersAPI.getAll;
export const createUser = (data) => api.post('/users', data);
export const deleteUser = usersAPI.delete;

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