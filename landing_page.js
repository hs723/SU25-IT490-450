import React, { useState, useEffect } from 'react';
import { Star, Users, Brain, Trophy, Target, ArrowRight, Play, GamepadIcon, Lightbulb, X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function TriviaGameLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation errors
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  
  // Loading states for server validation
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Server validation results
  const [serverErrors, setServerErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  // Simulated server-side validation
  const simulateServerValidation = async (formData, type) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const errors = {};

    if (type === 'login') {
      // Simulate server checking credentials
      if (formData.email === 'taken@example.com') {
        errors.email = 'Account not found';
      }
      if (formData.email === 'user@example.com' && formData.password !== 'Password123') {
        errors.password = 'Incorrect password';
      }
    }

    if (type === 'register') {
      // Simulate server checking for existing users
      if (formData.email === 'taken@example.com') {
        errors.email = 'Email address is already registered';
      }
      if (formData.username === 'admin' || formData.username === 'test') {
        errors.username = 'Username is already taken';
      }
      // Simulate checking against common passwords
      const commonPasswords = ['password123', '12345678', 'qwerty123'];
      if (commonPasswords.includes(formData.password.toLowerCase())) {
        errors.password = 'Password is too common. Please choose a more secure password';
      }
    }

    return errors;
  };

  // Login form validation
  const validateLoginForm = () => {
    const errors = {};

    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginForm.password) {
      errors.password = 'Password is required';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Register form validation
  const validateRegisterForm = () => {
    const errors = {};

    if (!registerForm.username) {
      errors.username = 'Username is required';
    } else if (!validateUsername(registerForm.username)) {
      errors.username = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
    }

    if (!registerForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!registerForm.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(registerForm.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setLoginErrors({});
    setServerErrors({});
    
    // Client-side validation first
    if (!validateLoginForm()) {
      return;
    }

    setIsLoginLoading(true);

    try {
      // Server-side validation
      const serverValidationErrors = await simulateServerValidation(loginForm, 'login');
      
      if (Object.keys(serverValidationErrors).length > 0) {
        setServerErrors(serverValidationErrors);
        setIsLoginLoading(false);
        return;
      }

      // Success - form is valid
      console.log('Login successful:', loginForm);
      alert('Login successful!');
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });
      setLoginErrors({});
      setServerErrors({});
      
    } catch (error) {
      console.error('Login error:', error);
      setServerErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setRegisterErrors({});
    setServerErrors({});
    
    // Client-side validation first
    if (!validateRegisterForm()) {
      return;
    }

    setIsRegisterLoading(true);

    try {
      // Server-side validation
      const serverValidationErrors = await simulateServerValidation(registerForm, 'register');
      
      if (Object.keys(serverValidationErrors).length > 0) {
        setServerErrors(serverValidationErrors);
        setIsRegisterLoading(false);
        return;
      }

      // Success - form is valid
      console.log('Registration successful:', registerForm);
      alert('Registration successful! Please check your email to verify your account.');
      setShowRegisterModal(false);
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
      setRegisterErrors({});
      setServerErrors({});
      
    } catch (error) {
      console.error('Registration error:', error);
      setServerErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleLoginChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    // Clear both client and server errors when user types
    if (loginErrors[field]) {
      setLoginErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverErrors[field]) {
      setServerErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegisterChange = (field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    // Clear both client and server errors when user types
    if (registerErrors[field]) {
      setRegisterErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverErrors[field]) {
      setServerErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Smart Questions",
      description: "AI-powered trivia questions that adapt to your knowledge level and keep you challenged."
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Compete & Win",
      description: "Battle friends in real-time matches or climb the global leaderboards to prove your trivia mastery."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Multiple Categories",
      description: "From science to pop culture, sports to history - test your knowledge across 20+ categories."
    }
  ];

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Trivia Champion",
      content: "The most addictive trivia game I've ever played! The questions are challenging and fair.",
      rating: 5
    },
    {
      name: "Jamie Chen",
      role: "Quiz Master",
      content: "Perfect for game nights with friends. The multiplayer mode is incredibly fun!",
      rating: 5
    },
    {
      name: "Morgan Taylor",
      role: "Knowledge Seeker",
      content: "I've learned so much while having fun. The categories are diverse and engaging.",
      rating: 5
    }
  ];

  const categories = [
    "Science & Nature", "History", "Sports", "Entertainment", "Geography", "Literature", 
    "Technology", "Art & Culture", "Food & Drink", "Movies & TV", "Music", "Politics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">QuizMaster</span>
            </div>
            
            <div className="flex items-center space-x-4 sm:space-x-8">
              <button 
                onClick={() => setShowLoginModal(true)}
                className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
              >
                Profile
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
              >
                Register
              </button>
              <button className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md mx-4 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Login to QuizMaster</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {serverErrors.general && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{serverErrors.general}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => handleLoginChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      (loginErrors.email || serverErrors.email) ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your email"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    title="Please enter a valid email address"
                  />
                </div>
                {(loginErrors.email || serverErrors.email) && (
                  <p className="mt-1 text-sm text-red-400">{loginErrors.email || serverErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength="8"
                    value={loginForm.password}
                    onChange={(e) => handleLoginChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      (loginErrors.password || serverErrors.password) ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your password"
                    title="Password must be at least 8 characters long"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {(loginErrors.password || serverErrors.password) && (
                  <p className="mt-1 text-sm text-red-400">{loginErrors.password || serverErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoginLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoginLoading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md mx-4 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Join QuizMaster</h2>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
              {serverErrors.general && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{serverErrors.general}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    minLength="3"
                    maxLength="20"
                    value={registerForm.username}
                    onChange={(e) => handleRegisterChange('username', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      (registerErrors.username || serverErrors.username) ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Choose a username"
                    pattern="[a-zA-Z0-9_]+"
                    title="Username must be 3-20 characters and contain only letters, numbers, and underscores"
                  />
                </div>
                {(registerErrors.username || serverErrors.username) && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.username || serverErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => handleRegisterChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      (registerErrors.email || serverErrors.email) ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your email"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    title="Please enter a valid email address"
                  />
                </div>
                {(registerErrors.email || serverErrors.email) && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.email || serverErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength="8"
                    value={registerForm.password}
                    onChange={(e) => handleRegisterChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      (registerErrors.password || serverErrors.password) ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Create a password"
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                    title="Password must be at least 8 characters with uppercase, lowercase, and number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {(registerErrors.password || serverErrors.password) && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.password || serverErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength="8"
                    value={registerForm.confirmPassword}
                    onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      registerErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Confirm your password"
                    title="Please confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isRegisterLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isRegisterLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Login here
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div 
              className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm text-gray-300">Join 50,000+ trivia champions worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Test Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Knowledge</span>
              <br />
              Challenge Your Mind
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Dive into the ultimate trivia experience! Battle friends, climb leaderboards, and discover fascinating facts across dozens of categories. Your brain will thank you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center">
                <Play className="mr-2 w-5 h-5" />
                Play Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all flex items-center">
                <GamepadIcon className="mr-2 w-5 h-5" />
                Practice Mode
              </button>
            </div>
          </div>

          {/* Hero Visual - Trivia Game Interface */}
          <div className="mt-20 relative">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
              <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Science & Nature</div>
                      <div className="text-gray-400 text-sm">Question 3 of 10</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">1,250 pts</div>
                    <div className="text-gray-400 text-sm">30 seconds</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-white text-lg font-medium mb-4">
                    What is the chemical symbol for gold?
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-700 hover:bg-blue-600 transition-colors rounded-lg p-3 cursor-pointer">
                      <span className="text-white">A) Au</span>
                    </div>
                    <div className="bg-gray-700 hover:bg-blue-600 transition-colors rounded-lg p-3 cursor-pointer">
                      <span className="text-white">B) Ag</span>
                    </div>
                    <div className="bg-gray-700 hover:bg-blue-600 transition-colors rounded-lg p-3 cursor-pointer">
                      <span className="text-white">C) Go</span>
                    </div>
                    <div className="bg-gray-700 hover:bg-blue-600 transition-colors rounded-lg p-3 cursor-pointer">
                      <span className="text-white">D) Gd</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why players love
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> QuizMaster</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The most engaging trivia experience with features designed for knowledge seekers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-blue-400 mb-4 group-hover:text-purple-400 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Explore
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> 20+ Categories</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From ancient history to cutting-edge science, find your expertise
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer text-center"
              >
                <Lightbulb className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <span className="text-white text-sm font-medium">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What players
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> are saying</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to prove your knowledge?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the ultimate trivia challenge and compete with players worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center justify-center">
                <Play className="mr-2 w-5 h-5" />
                Start Playing Now
              </button>
              <button className="border border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all">
                View Leaderboards
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">QuizMaster</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Rules</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 QuizMaster. All rights reserved. Challenge your mind daily!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}