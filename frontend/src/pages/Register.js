import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../store/slices/authSlice';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock, User, Building2, Briefcase } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
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

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one special character');
    }

    return { score, feedback };
  };

  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      errors.last_name = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      errors.password = 'Password is too weak';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }

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

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await dispatch(registerUser(registrationData));
      if (registerUser.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'bg-red-500';
    if (passwordStrength.score <= 2) return 'bg-yellow-500';
    if (passwordStrength.score <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Weak';
    if (passwordStrength.score <= 2) return 'Fair';
    if (passwordStrength.score <= 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient Background */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-purple-700">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <h1 className="text-4xl font-bold mb-4">Join CompanyGrow</h1>
              <p className="text-xl opacity-90 mb-8">Start your learning journey today</p>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Personalized Learning</div>
                  <div className="opacity-80">Courses tailored to your role and goals</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Skills Development</div>
                  <div className="opacity-80">Build expertise in your field</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Career Growth</div>
                  <div className="opacity-80">Advance your professional journey</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className={`max-w-md w-full space-y-8 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
            <p className="mt-2 text-sm text-gray-600">
            Join CompanyGrow and start your learning journey
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
                    Registration Failed
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    {typeof error === 'string' ? error : 'An error occurred during registration. Please try again.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${fieldErrors.first_name ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                    fieldErrors.first_name 
                          ? 'border-red-300 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-medium`}
                  placeholder="John"
                />
                  </div>
                {fieldErrors.first_name && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {fieldErrors.first_name}
                  </div>
                )}
              </div>

              <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${fieldErrors.last_name ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                    fieldErrors.last_name 
                          ? 'border-red-300 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-medium`}
                  placeholder="Doe"
                />
                  </div>
                {fieldErrors.last_name && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {fieldErrors.last_name}
                  </div>
                )}
              </div>
            </div>

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
                placeholder="john.doe@company.com"
              />
                </div>
              {fieldErrors.email && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm font-medium"
                  placeholder="Engineering"
                />
                  </div>
              </div>

              <div>
                  <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
                    Position <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                <input
                  id="position"
                  name="position"
                  type="text"
                  value={formData.position}
                  onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm font-medium"
                  placeholder="Developer"
                />
                  </div>
              </div>
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
                  required
                  value={formData.password}
                  onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                    fieldErrors.password 
                        ? 'border-red-300 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-medium`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                  <div className="mt-3">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-600' : 
                      passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                        <span className="font-medium">Needs:</span> {passwordStrength.feedback.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {fieldErrors.password && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${
                      fieldErrors.confirmPassword ? 'text-red-400' : 
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                    fieldErrors.confirmPassword 
                        ? 'border-red-300 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500' 
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-medium`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Passwords match
                </div>
              )}

              {fieldErrors.confirmPassword && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fieldErrors.confirmPassword}
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
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                } transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              {loading ? (
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create your account
                </div>
              )}
            </button>
          </div>

            {/* Link to Login */}
          <div className="text-center">
            <div className="text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Register;