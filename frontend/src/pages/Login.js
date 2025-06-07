import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Eye, EyeOff, LogIn, AlertCircle, Mail, Lock, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  // Animation effect on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts or when user starts typing
  useEffect(() => {
    return () => {
      if (dispatch) {
      dispatch(clearError());
      }
    };
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('Auth state changed:', { loading, error, isAuthenticated });
  }, [loading, error, isAuthenticated]);

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear global error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('Attempting login with:', { email: formData.email, password: '[HIDDEN]' });

    try {
      const result = await dispatch(loginUser(formData));
      console.log('Login result:', result);
      
      if (loginUser.fulfilled.match(result)) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login failed, error should be in Redux state');
      }
    } catch (err) {
      console.error('Login submission error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const demoCredentials = [
    { label: 'Admin', email: 'admin@companygrow.com', password: 'admin123' },
    { label: 'Employee', email: 'john.doe@companygrow.com', password: 'password123' }
  ];

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setFieldErrors({});
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className={`max-w-md w-full space-y-8 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
          </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome back
          </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your CompanyGrow account
          </p>
        </div>

          {/* Global Error Message - Enhanced */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">
                    Login Failed
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              Debug: loading={loading ? 'true' : 'false'}, error="{error}", isAuth={isAuthenticated ? 'true' : 'false'}
            </div>
          )}

          {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
            {/* Email Field */}
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                    fieldErrors.email 
                        ? 'border-red-300 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-medium`}
                    placeholder="Enter your email address"
                />
              </div>
              {fieldErrors.email && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${fieldErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                    fieldErrors.password 
                        ? 'border-red-300 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-medium`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fieldErrors.password}
                </div>
              )}
            </div>
          </div>

            {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              {loading ? (
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in to your account
                </div>
              )}
            </button>
          </div>

            {/* Links */}
          <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Forgot your password?
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Create an account
              </Link>
          </div>
        </form>

        {/* Demo Credentials */}
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-sm font-semibold text-blue-900">Try Demo Accounts</h4>
            </div>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillDemoCredentials(cred.email, cred.password)}
                  className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-blue-900 text-sm">{cred.label}</div>
                      <div className="text-xs text-blue-600">{cred.email}</div>
                    </div>
                    <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Click to use
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Gradient Background */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <h1 className="text-4xl font-bold mb-4">Welcome to CompanyGrow</h1>
              <p className="text-xl opacity-90 mb-8">Empowering growth through learning and development</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Learn & Grow</div>
                  <div className="opacity-80">Access curated courses</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Track Progress</div>
                  <div className="opacity-80">Monitor your development</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Earn Badges</div>
                  <div className="opacity-80">Showcase achievements</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Collaborate</div>
                  <div className="opacity-80">Work on projects together</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;