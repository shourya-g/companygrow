import { createSlice } from '@reduxjs/toolkit'

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    loading: false,
    error: null
  },
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const { setCourses, setLoading } = courseSlice.actions
export default courseSlice.reducer