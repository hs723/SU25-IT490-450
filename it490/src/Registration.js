
import React, { useState } from 'react';
import './Registration.css';

function Registration() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate form submission
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Registration successful! 🎉');
        console.log('Form submitted:', formData);
      } catch (error) {
        console.error('Registration error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="registration-container">
      {/* Navigation */}
      <nav className="registration-navbar">
        <div className="registration-nav-container">
          <div className="registration-nav-content">
            <div className="registration-logo">
              Trivia
            </div>
          </div>
        </div>
      </nav>

      {/* Registration Form */}
      <div className="registration-form-section">
        <div className="registration-form-container">
          <div className="registration-form-header">
            <h1 className="registration-title">
              <div className="registration-title-line1">JOIN</div>
              <div className="registration-title-line2">TRIVIA!</div>
            </h1>
            <p className="registration-subtitle">Create your account and start your trivia journey</p>
          </div>

          <div className="registration-form">
            {/* Name Field */}
            <div className="registration-form-group">
              <label className="registration-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`registration-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && (
                <span className="registration-error-message">{errors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="registration-form-group">
              <label className="registration-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`registration-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <span className="registration-error-message">{errors.email}</span>
              )}
            </div>

            {/* Password Fields */}
            <div className="registration-form-row">
              <div className="registration-form-group">
                <label className="registration-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create password"
                  className={`registration-input ${errors.password ? 'error' : ''}`}
                />
                {errors.password && (
                  <span className="registration-error-message">{errors.password}</span>
                )}
              </div>

              <div className="registration-form-group">
                <label className="registration-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className={`registration-input ${errors.confirmPassword ? 'error' : ''}`}
                />
                {errors.confirmPassword && (
                  <span className="registration-error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="registration-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="registration-spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                </>
              )}
            </button>
          </div>

          <div className="registration-form-footer">
            <p className="registration-footer-text">
              Already have an account? <a href="/login" className="registration-footer-link">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;