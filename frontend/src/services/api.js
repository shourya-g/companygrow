// Updated frontend/src/services/api.js with enhanced skill management

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

// AUTH API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/verify'),
};

// ENHANCED SKILLS API
export const skillsAPI = {
  // Get all skills with enhanced filtering and pagination
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    return api.get(`/skills${queryString ? `?${queryString}` : ''}`);
  },

  // Get skill by ID with optional includes
  getById: (id, options = {}) => {
    const queryParams = new URLSearchParams();
    
    if (options.include_users) queryParams.append('include_users', 'true');
    if (options.include_courses) queryParams.append('include_courses', 'true');
    
    const queryString = queryParams.toString();
    return api.get(`/skills/${id}${queryString ? `?${queryString}` : ''}`);
  },

  // Create new skill (admin only)
  create: (skillData) => api.post('/skills', skillData),

  // Update existing skill (admin only)
  update: (id, skillData) => api.put(`/skills/${id}`, skillData),

  // Delete skill (admin only)
  delete: (id) => api.delete(`/skills/${id}`),

  // Search skills with suggestions
  search: (query, options = {}) => {
    const queryParams = new URLSearchParams({ q: query });
    
    if (options.category) queryParams.append('category', options.category);
    if (options.limit) queryParams.append('limit', options.limit);
    
    return api.get(`/skills/search?${queryParams.toString()}`);
  },

  // Get skill categories with counts
  getCategories: () => api.get('/skills/categories'),

  // Get skill statistics (admin/manager only)
  getStatistics: () => api.get('/skills/statistics'),

  // Bulk import skills (admin only)
  bulkImport: (data) => api.post('/skills/bulk-import', data),

  // Get skills by category
  getByCategory: (category, options = {}) => {
    return skillsAPI.getAll({ ...options, category });
  },

  // Get popular skills (top skills by user count)
  getPopular: (limit = 10) => {
    return skillsAPI.getAll({ 
      sort: 'user_count', 
      order: 'DESC', 
      limit,
      include_stats: 'true'
    });
  }
};

// ENHANCED USERS API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),

  // Enhanced skill management for users
  getSkills: (userId, options = {}) => {
    const queryParams = new URLSearchParams();
    
    if (options.include_verified_only) queryParams.append('verified_only', 'true');
    if (options.category) queryParams.append('category', options.category);
    if (options.min_proficiency) queryParams.append('min_proficiency', options.min_proficiency);
    
    const queryString = queryParams.toString();
    return api.get(`/users/${userId}/skills${queryString ? `?${queryString}` : ''}`);
  },

  addSkill: (userId, skillData) => {
    const validatedData = {
      skill_id: parseInt(skillData.skill_id),
      proficiency_level: parseInt(skillData.proficiency_level) || 1,
      years_experience: parseInt(skillData.years_experience) || 0
    };
    
    return api.post(`/users/${userId}/skills`, validatedData);
  },

  updateSkill: (userId, skillId, skillData) => {
    const validatedData = {};
    
    if (skillData.proficiency_level !== undefined) {
      validatedData.proficiency_level = parseInt(skillData.proficiency_level);
    }
    if (skillData.years_experience !== undefined) {
      validatedData.years_experience = parseInt(skillData.years_experience);
    }
    if (skillData.is_verified !== undefined) {
      validatedData.is_verified = Boolean(skillData.is_verified);
    }
    
    return api.put(`/users/${userId}/skills/${skillId}`, validatedData);
  },

  deleteSkill: (userId, skillId) => api.delete(`/users/${userId}/skills/${skillId}`),

  // Get user profile with comprehensive data
  getProfile: (userId) => api.get(`/users/${userId}/profile`),

  // Get user dashboard data
  getDashboard: (userId) => api.get(`/users/${userId}/dashboard`),

  // Activate/deactivate user (admin only)
  setActive: (userId, isActive) => api.put(`/users/${userId}/activate`, { is_active: isActive })
};

// PROJECTS API (enhanced)
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  
  // Get project skill requirements
  getSkillRequirements: (projectId) => api.get(`/projectSkills/project/${projectId}`),
  
  // Get skill match analysis for project
  getSkillAnalysis: (projectId) => api.get(`/projectSkills/analysis/${projectId}`)
};

// COURSES API (enhanced)
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  
  // Get course skills taught
  getSkillsTaught: (courseId) => api.get(`/courseSkills/course/${courseId}`)
};

// BADGES API
export const badgesAPI = {
  getAll: () => api.get('/badges'),
  getById: (id) => api.get(`/badges/${id}`),
  create: (data) => api.post('/badges', data),
  update: (id, data) => api.put(`/badges/${id}`, data),
  delete: (id) => api.delete(`/badges/${id}`)
};

// NOTIFICATIONS API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// PAYMENTS API
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  createPayout: (data) => api.post('/payments/payout', data),
  setupStripeAccount: () => api.post('/payments/setup-stripe')
};

// ANALYTICS API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUserStats: () => api.get('/analytics/users'),
  getProjectStats: () => api.get('/analytics/projects'),
  getSkillDistribution: () => api.get('/analytics/skills'),
  getCourseStats: () => api.get('/analytics/courses'),
  getPaymentStats: () => api.get('/analytics/payments'),
  getTokenStats: () => api.get('/analytics/tokens')
};

// SKILL UTILITIES
export const skillUtils = {
  validateProficiencyLevel: (level) => {
    const numLevel = parseInt(level);
    return numLevel >= 1 && numLevel <= 5 ? numLevel : 1;
  },

  validateYearsExperience: (years) => {
    const numYears = parseInt(years);
    return numYears >= 0 && numYears <= 50 ? numYears : 0;
  },

  getProficiencyLabel: (level) => {
    const labels = {
      1: 'Beginner',
      2: 'Basic', 
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  },

  getProficiencyColor: (level) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-green-100 text-green-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  },

  getCategoryColor: (category) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      soft: 'bg-green-100 text-green-800',
      leadership: 'bg-purple-100 text-purple-800',
      business: 'bg-orange-100 text-orange-800',
      creative: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  },

  calculatePortfolioScore: (userSkills) => {
    if (!Array.isArray(userSkills) || userSkills.length === 0) return 0;
    
    const totalScore = userSkills.reduce((sum, skill) => {
      const baseScore = skill.proficiency_level * 10;
      const experienceBonus = Math.min(skill.years_experience * 2, 20);
      const verificationBonus = skill.is_verified ? 10 : 0;
      return sum + baseScore + experienceBonus + verificationBonus;
    }, 0);
    
    return Math.round(totalScore / userSkills.length);
  }
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
  }
};

// Legacy exports for backward compatibility
export const fetchLogin = authAPI.login;
export const fetchRegister = authAPI.register;
export const fetchUsers = usersAPI.getAll;
export const createUser = usersAPI.create;
export const deleteUser = usersAPI.delete;
export const fetchProjects = projectsAPI.getAll;
export const createProject = projectsAPI.create;
export const deleteProject = projectsAPI.delete;
export const fetchCourses = coursesAPI.getAll;
export const createCourse = coursesAPI.create;
export const deleteCourse = coursesAPI.delete;
export const fetchSkills = skillsAPI.getAll;
export const createSkill = skillsAPI.create;
export const deleteSkill = skillsAPI.delete;
export const fetchBadges = badgesAPI.getAll;
export const createBadge = badgesAPI.create;
export const deleteBadge = badgesAPI.delete;
export const fetchNotifications = notificationsAPI.getAll;
export const fetchPayments = paymentsAPI.getAll;
export const createPayout = paymentsAPI.createPayout;

export default api;