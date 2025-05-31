import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import courseSlice from './slices/courseSlice';
import projectSlice from './slices/projectSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: courseSlice,
    projects: projectSlice,
  },
});
