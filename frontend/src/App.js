import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
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

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
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
            } />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
