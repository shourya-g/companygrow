import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, tokenUtils } from '../../services/api';

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
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
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
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
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
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch user';
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
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const errorMessage = error.response?.data?.error?.message || 'Token verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      // Use authAPI.updateUser instead of the non-existent method
      const response = await authAPI.updateUser(userId, userData);
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Profile update failed';
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