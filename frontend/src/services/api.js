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
  getProfile: (userId) => api.get(`/users/${userId}/profile`),
  getDashboard: (userId) => api.get(`/users/${userId}/dashboard`),
  activate: (userId, data) => api.put(`/users/${userId}/activate`, data),
};

// Legacy user exports
export const fetchUsers = usersAPI.getAll;
export const createUser = (data) => api.post('/users', data);
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
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/courses${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),
  getRecommendations: () => api.get('/courses/recommendations/me'),
  
  // Enrollment methods
  enrollInCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  unenrollFromCourse: (courseId) => api.delete(`/courses/${courseId}/unenroll`),
  updateProgress: (courseId, progressData) => api.put(`/courses/${courseId}/progress`, progressData),
  
  // Admin methods
  getCourseEnrollments: (courseId) => api.get(`/courses/${courseId}/enrollments`),
  getCourseStats: (courseId) => api.get(`/courses/${courseId}/stats`),
};

// Legacy course exports
export const fetchCourses = (params) => coursesAPI.getAll(params);
export const createCourse = coursesAPI.create;
export const deleteCourse = coursesAPI.delete;

// SKILLS API
export const skillsAPI = {
  getAll: () => api.get('/skills'),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  search: (query) => api.get(`/skills?search=${encodeURIComponent(query)}`),
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

// Course Enrollment API
export const courseEnrollmentAPI = {
  getAll: () => api.get('/courseEnrollments'),
  getById: (id) => api.get(`/courseEnrollments/${id}`),
  getUserEnrollments: (userId) => api.get(`/courseEnrollments/user/${userId}`),
  enroll: (data) => api.post('/courseEnrollments', data),
  updateProgress: (id, progressData) => api.put(`/courseEnrollments/${id}/progress`, progressData),
  unenroll: (id) => api.delete(`/courseEnrollments/${id}`),
};

// Course Skills API
export const courseSkillsAPI = {
  getAll: () => api.get('/courseSkills'),
  getById: (id) => api.get(`/courseSkills/${id}`),
  getCourseSkills: (courseId) => api.get(`/courseSkills/course/${courseId}`),
  getSkillCourses: (skillId) => api.get(`/courseSkills/skill/${skillId}`),
  addSkillToCourse: (data) => api.post('/courseSkills', data),
  updateCourseSkill: (id, data) => api.put(`/courseSkills/${id}`, data),
  removeSkillFromCourse: (id) => api.delete(`/courseSkills/${id}`),
};

// PROJECT ASSIGNMENTS API
export const projectAssignmentsAPI = {
  getAll: () => api.get('/projectAssignments'),
  getById: (id) => api.get(`/projectAssignments/${id}`),
  getRecommendations: (projectId) => api.get(`/projectAssignments/recommendations/${projectId}`),
  getStatistics: () => api.get('/projectAssignments/statistics'),
  getUserAssignments: (userId) => api.get(`/projectAssignments/user/${userId}`),
  getProjectAssignments: (projectId) => api.get(`/projectAssignments/project/${projectId}`),
  assignUser: (data) => api.post('/projectAssignments', data),
  update: (id, data) => api.put(`/projectAssignments/${id}`, data),
  remove: (id) => api.delete(`/projectAssignments/${id}`),
};

// Legacy project assignment exports (for backward compatibility)
export const fetchProjectAssignments = projectAssignmentsAPI.getAll;
export const createProjectAssignment = projectAssignmentsAPI.assignUser;
export const updateProjectAssignment = projectAssignmentsAPI.update;
export const deleteProjectAssignment = projectAssignmentsAPI.remove;
export const fetchAssignmentRecommendations = projectAssignmentsAPI.getRecommendations;

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

// PROJECT SKILLS API
export const projectSkillsAPI = {
  getAll: () => api.get('/projectSkills'),
  getById: (id) => api.get(`/projectSkills/${id}`),
  getProjectSkills: (projectId) => api.get(`/projectSkills/project/${projectId}`),
  getSkillProjects: (skillId) => api.get(`/projectSkills/skill/${skillId}`),
  addSkillToProject: (data) => api.post('/projectSkills', data),
  updateProjectSkill: (id, data) => api.put(`/projectSkills/${id}`, data),
  removeSkillFromProject: (id) => api.delete(`/projectSkills/${id}`),
};