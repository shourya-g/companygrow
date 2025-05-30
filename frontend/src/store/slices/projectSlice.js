import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    loading: false,
    error: null
  },
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const { setProjects, setLoading } = projectSlice.actions
export default projectSlice.reducer