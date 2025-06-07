import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// Initialize state from localStorage
const initializeAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return {
      user,
      token,
      isAuthenticated: !!(token && user),
      loading: false,
      error: null,
      lastActivity: Date.now(),
    };
  } catch (error) {
    // Clear corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      lastActivity: null,
    };
  }
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store in localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Enhanced error extraction with multiple fallback paths
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Try different possible error message locations
        if (responseData.error?.message) {
          errorMessage = responseData.error.message;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          errorMessage = responseData.errors[0].msg || responseData.errors[0].message || responseData.errors[0];
        }
        
        // Handle specific HTTP status codes
        if (error.response.status === 401) {
          if (!responseData.error?.message && !responseData.message) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.status >= 400 && error.response.status < 500) {
          if (!responseData.error?.message && !responseData.message) {
            errorMessage = 'Invalid request. Please check your information and try again.';
          }
        }
      } else if (error.message) {
        if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('Final error message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      
      // Store in localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data.data;
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Enhanced error extraction with multiple fallback paths
      let errorMessage = 'Registration failed. Please check your information and try again.';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Try different possible error message locations
        if (responseData.error?.message) {
          errorMessage = responseData.error.message;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          errorMessage = responseData.errors[0].msg || responseData.errors[0].message || responseData.errors[0];
        }
        
        // Handle specific status codes
        if (error.response.status === 409) {
          if (!responseData.error?.message && !responseData.message) {
            errorMessage = 'Email is already registered. Please use a different email or try logging in.';
          }
        } else if (error.response.status === 400) {
          if (!responseData.error?.message && !responseData.message) {
            errorMessage = 'Invalid information provided. Please check your details and try again.';
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.message) {
        if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('Final error message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (error) {
      console.error('Get current user error:', error);
      
      let errorMessage = 'Failed to fetch user information.';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyToken();
      return response.data.data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      let errorMessage = 'Session expired. Please log in again.';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateUser(userId, userData);
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (error) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = initializeAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear loading state
    clearLoading: (state) => {
      state.loading = false;
    },
    
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    
    // Update last activity
    updateActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    // Manual login success (for backward compatibility)
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.lastActivity = Date.now();
      
      // Store in localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    
    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.lastActivity = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    // Update user data
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
    
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
    
    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Verify token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
    
    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearLoading, 
  clearError, 
  updateActivity, 
  loginSuccess, 
  logout, 
  updateUser 
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;