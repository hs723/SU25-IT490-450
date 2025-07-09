import React, { useRef, useState } from 'react';
import '../css/RegistrationPage.css';

function Registration() {
  const inputRef = useRef(null);
  const [inputs, setInputs] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const validateForm = () => {
    // Check if all fields are filled
    if (!inputs.email || !inputs.name || !inputs.password || !inputs.confirmPassword) {
      setMessage('All fields are required');
      setMessageType('error');
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return false;
    }

    // Check name length
    if (inputs.name.length < 2) {
      setMessage('Name must be at least 2 characters long');
      setMessageType('error');
      return false;
    }

    // Check password length
    if (inputs.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return false;
    }

    // Check if passwords match
    if (inputs.password !== inputs.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending registration data:', inputs);

      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inputs.email,
          name: inputs.name,
          password: inputs.password,
          confirmPassword: inputs.confirmPassword
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON response');
      }

      const data = await response.json();
      console.log('Response from backend:', data);

      if (response.ok) {
        // Success
        const successMessage = data.message || 'Registration successful!';
        setMessage(successMessage);
        setMessageType('success');
        
        // Clear form on success
        setInputs({
          email: '',
          name: '',
          password: '',
          confirmPassword: ''
        });

        // Store user data if provided
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
          console.log('User data stored:', data.user);
        }

      } else {
        // Server returned an error
        if (data.errors) {
          // Handle specific field errors or general error
          if (data.errors.general) {
            setMessage(data.errors.general);
          } else if (data.errors.email) {
            setMessage(data.errors.email);
          } else if (data.errors.password) {
            setMessage(data.errors.password);
          } else if (data.errors.confirmPassword) {
            setMessage(data.errors.confirmPassword);
          } else {
            setMessage('Registration failed. Please check your input.');
          }
        } else {
          setMessage(data.message || `Registration failed (${response.status})`);
        }
        setMessageType('error');
      }

    } catch (error) {
      console.error('Error during registration:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('Cannot connect to server. Make sure the backend is running on port 5001.');
      } else if (error.message.includes('JSON')) {
        setMessage('Server error: Invalid response format');
      } else {
        setMessage(`Network error: ${error.message}`);
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({ ...values, [name]: value }));
    
    // Clear message when user starts typing
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  return (
    <div className="main-container">
      <div className="form-container">
        <h2>Registration</h2>
        
        {/* Display messages */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={inputs.email || ""} 
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          
          <input 
            ref={inputRef}
            type="text" 
            name="name" 
            placeholder="Full Name" 
            value={inputs.name || ""} 
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={inputs.password || ""} 
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            value={inputs.confirmPassword || ""} 
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          
          {/* Terms and conditions text */}
          <div style={{
            color: '#9ca3af',
            fontSize: '0.75rem',
            textAlign: 'center',
            lineHeight: '1.4',
            marginTop: '0.5rem'
          }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
          
          <button 
            type="submit" 
            className="opacity"
            disabled={isLoading}
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registration;