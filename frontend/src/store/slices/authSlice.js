import { createSlice } from '@reduxjs/toolkit';

let user = null;
let token = localStorage.getItem('token');
try {
  const userStr = localStorage.getItem('user');
  if (userStr) user = JSON.parse(userStr);
} catch {}

const initialState = {
  user,
  token,
  isAuthenticated: !!token && !!user,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setLoading, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
