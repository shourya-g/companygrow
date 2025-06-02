import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';

function RequireAuth({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated || !!state.auth.token);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <RequireAuth>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1">
                    <Navbar />
                    <main className="p-6">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/analytics" element={<Analytics />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </RequireAuth>
            } />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
