import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, clearError } from '../store/slices/authSlice';
import { Eye, EyeOff, Heart, Github, Linkedin, Facebook } from 'lucide-react';
import './AnimatedAuth.css';

const AnimatedAuth = () => {
  const location = useLocation();
  const [isRightPanelActive, setIsRightPanelActive] = useState(location.pathname === '/register');
  const [mounted, setMounted] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: '',
    position: ''
  });
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  // Animation effect on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update panel based on URL
  useEffect(() => {
    setIsRightPanelActive(location.pathname === '/register');
  }, [location.pathname]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching panels
  useEffect(() => {
    setErrors({});
    if (error) {
      dispatch(clearError());
    }
  }, [isRightPanelActive, dispatch, error]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = 'Email is required';
    if (!loginData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!registerData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!registerData.email.trim()) newErrors.email = 'Email is required';
    if (!registerData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    try {
      const result = await dispatch(loginUser(loginData));
      if (loginUser.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    
    try {
      const result = await dispatch(registerUser(registerData));
      if (registerUser.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  const fillDemoCredentials = (email, password) => {
    setLoginData({ email, password });
    setErrors({});
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className={`animated-auth-container ${isRightPanelActive ? 'right-panel-active' : ''} ${mounted ? 'mounted' : ''}`}>
        
        {/* Mobile Toggle - Only visible on mobile */}
        <div className="mobile-toggle md:hidden">
          <button 
            className={!isRightPanelActive ? 'active' : ''}
            onClick={() => setIsRightPanelActive(false)}
          >
            Sign In
          </button>
          <button 
            className={isRightPanelActive ? 'active' : ''}
            onClick={() => setIsRightPanelActive(true)}
          >
            Sign Up
          </button>
        </div>
        
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <h1 className="auth-title">Create Account</h1>
            
            <div className="social-container">
              <button type="button" className="social-link">
                <Facebook size={20} />
              </button>
              <button type="button" className="social-link">
                <Github size={20} />
              </button>
              <button type="button" className="social-link">
                <Linkedin size={20} />
              </button>
            </div>
            
            <span className="auth-subtitle">or use your email for registration</span>
            
            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={registerData.first_name}
                  onChange={handleRegisterChange}
                  className={`auth-input ${errors.first_name ? 'error' : ''}`}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={registerData.last_name}
                  onChange={handleRegisterChange}
                  className={`auth-input ${errors.last_name ? 'error' : ''}`}
                />
              </div>
            </div>
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              className={`auth-input ${errors.email ? 'error' : ''}`}
            />
            
            <div className="password-input-container">
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className={`auth-input ${errors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="password-toggle"
              >
                {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="input-row">
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={registerData.department}
                onChange={handleRegisterChange}
                className="auth-input"
              />
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={registerData.position}
                onChange={handleRegisterChange}
                className="auth-input"
              />
            </div>
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <h1 className="auth-title">Sign In</h1>
            
            <div className="social-container">
              <button type="button" className="social-link">
                <Facebook size={20} />
              </button>
              <button type="button" className="social-link">
                <Github size={20} />
              </button>
              <button type="button" className="social-link">
                <Linkedin size={20} />
              </button>
            </div>
            
            <span className="auth-subtitle">or use your account</span>
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              className={`auth-input ${errors.email ? 'error' : ''}`}
            />
            
            <div className="password-input-container">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                className={`auth-input ${errors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="password-toggle"
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <button type="button" className="forgot-password">Forgot your password?</button>
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <p className="demo-title">Demo Accounts:</p>
              <div className="demo-buttons">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin@companygrow.com', 'admin123')}
                  className="demo-button"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('john.doe@companygrow.com', 'password123')}
                  className="demo-button"
                >
                  Employee
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="overlay-title">Welcome Back!</h1>
              <p className="overlay-text">To keep connected with us please login with your personal info</p>
              <button 
                className="ghost-button" 
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="overlay-title">Hello, Friend!</h1>
              <p className="overlay-text">Enter your personal details and start your journey with CompanyGrow</p>
              <button 
                className="ghost-button" 
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>{typeof error === 'string' ? error : 'An error occurred'}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="auth-footer">
        <p>
          Created with <Heart className="heart-icon" size={16} /> for CompanyGrow
        </p>
      </footer>


    </div>
  );
};

export default AnimatedAuth;