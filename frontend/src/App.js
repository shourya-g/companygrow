import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { verifyToken, updateActivity } from './store/slices/authSlice';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Skills from './pages/Skills';
import Badges from './pages/Badges';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import Rewards from './pages/Rewards';
import ProjectAssignments from './pages/ProjectAssignments';
import MyEnrollments from './pages/MyEnrollments';
import CourseForm from './pages/CourseForm';
import PublicProfile from './pages/PublicProfile';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Auth wrapper component
function AuthWrapper({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, token, lastActivity } = useSelector(state => state.auth);

  useEffect(() => {
    // Verify token on app load if we have one
    if (token && !isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, isAuthenticated]);

  useEffect(() => {
    // Update activity on user interactions
    const handleUserActivity = () => {
      if (isAuthenticated) {
        dispatch(updateActivity());
      }
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Auto-logout after inactivity (30 minutes)
    if (isAuthenticated && lastActivity) {
      const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
      const checkInactivity = () => {
        const now = Date.now();
        if (now - lastActivity > inactivityTimeout) {
          dispatch({ type: 'auth/logout' });
        }
      };

      const interval = setInterval(checkInactivity, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated, lastActivity]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return children;
}

// Protected route component
function RequireAuth({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && (!user || !requiredRole.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return children;
}

// Public route component (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector(state => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Main layout component
function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// App content component (separated for better organization)
function AppContent() {
  return (
    <AuthWrapper>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <RequireAuth>
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/dashboard" element={
          <RequireAuth>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/profile" element={
          <RequireAuth>
            <MainLayout>
              <Profile />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/browse-profiles" element={
          <RequireAuth>
            <MainLayout>
              <PublicProfile />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/profile/:userId" element={
          <RequireAuth>
            <MainLayout>
              <PublicProfile />
            </MainLayout>
          </RequireAuth>
        } />

        {/* Course Routes */}
        <Route path="/courses" element={
          <RequireAuth>
            <MainLayout>
              <Courses />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/courses/:id" element={
          <RequireAuth>
            <MainLayout>
              <CourseDetail />
            </MainLayout>
          </RequireAuth>
        } />

        {/* Course Creation/Edit Routes - Admin/Manager only */}
        <Route path="/courses/create" element={
          <RequireAuth requiredRole={['admin', 'manager']}>
            <MainLayout>
              <CourseForm />
            </MainLayout>
          </RequireAuth>
        } />
        <Route path="/courses/:id/edit" element={
          <RequireAuth requiredRole={['admin', 'manager']}>
            <MainLayout>
              <CourseForm />
            </MainLayout>
          </RequireAuth>
        } />

        {/* Project Routes */}
        <Route path="/projects" element={
          <RequireAuth>
            <MainLayout>
              <Projects />
            </MainLayout>
          </RequireAuth>
        } />

        {/* Skill and Badge Routes */}
        <Route path="/skills" element={
          <RequireAuth>
            <MainLayout>
              <Skills />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/badges" element={
          <RequireAuth>
            <MainLayout>
              <Badges />
            </MainLayout>
          </RequireAuth>
        } />

        {/* Notification and Payment Routes */}
        <Route path="/notifications" element={
          <RequireAuth>
            <MainLayout>
              <Notifications />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/payments" element={
          <RequireAuth>
            <MainLayout>
              <Payments />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/rewards" element={
          <RequireAuth>
            <MainLayout>
              <Rewards />
            </MainLayout>
          </RequireAuth>
        } />

        {/* My Learning / Enrollments Route */}
        <Route path="/my-enrollments" element={
          <RequireAuth>
            <MainLayout>
              <MyEnrollments />
            </MainLayout>
          </RequireAuth>
        } />

        {/* Admin/Manager Routes */}
        <Route path="/analytics" element={
          <RequireAuth requiredRole={['admin', 'manager']}>
            <MainLayout>
              <Analytics />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/users" element={
          <RequireAuth requiredRole={['admin']}>
            <MainLayout>
              <Users />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/project-assignments" element={
          <RequireAuth requiredRole={['admin', 'manager']}>
            <MainLayout>
              <ProjectAssignments />
            </MainLayout>
          </RequireAuth>
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <RequireAuth>
            <MainLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              </div>
            </MainLayout>
          </RequireAuth>
        } />
      </Routes>
    </AuthWrapper>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </Provider>
  );
}

export default App;