import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../css/LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('🚀 Starting login process...');

        // Basic validation
        if (!inputs.email || !inputs.password) {
            setError('Email and password are required');
            setIsLoading(false);
            return;
        }

        try {
            console.log('📤 Making fetch request...');
            
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: inputs.email,
                    password: inputs.password
                }),
            });

            console.log('📥 Got response, status:', response.status);

            const data = await response.json();
            console.log('📄 Response data:', data);
            
            if (response.ok && data.success) {
                console.log('✅ LOGIN SUCCESS!');
                
                // Store user data
                localStorage.setItem('userData', JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');
                console.log('💾 User data stored');
                
                // Dispatch storage event to notify other components
                window.dispatchEvent(new Event('storage'));
                
                alert(`Welcome back, ${data.user.name}!`);
                
                console.log('🚀 Redirecting to home page...');
                // Redirect to home page
                navigate('/');
                
            } else {
                console.log('❌ Login failed');
                if (data.errors && data.errors.general) {
                    setError(data.errors.general);
                } else {
                    setError('Login failed. Please check your credentials.');
                }
            }
            
        } catch (error) {
            console.error('💥 Error in catch block:', error);
            setError(`Network error: ${error.message}`);
        } finally {
            console.log('🏁 Setting loading to false...');
            setIsLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs(values => ({ ...values, [name]: value }));
        if (error) setError('');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleForgotPassword = () => {
        // Add forgot password functionality here
        console.log('Forgot password clicked');
        // navigate('/forgot-password');
    };

    return (
        <div className="login-container">
            <Navbar />
            
            {/* Animated background elements */}
            <div className="background-elements">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
            </div>

            {/* Login Section */}
            <section className="login-section">
                <div className="login-wrapper">
                    <div className="form-container">
                        <div className="login-header">
                            <h2 className="login-title">Welcome Back</h2>
                            <p className="login-subtitle">Sign in to continue your trivia journey</p>
                        </div>
                        
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                        
                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input 
                                    ref={inputRef}
                                    type="email" 
                                    name="email"
                                    placeholder="Email Address" 
                                    value={inputs.email}
                                    onChange={handleChange}
                                    required 
                                    className="login-input"
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder="Password" 
                                    value={inputs.password}
                                    onChange={handleChange}
                                    required 
                                    className="login-input"
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div className="forgot-password">
                                <button 
                                    type="button" 
                                    className="link-button"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="login-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
                        </form>
                        
                        <div className="register-link">
                            <p>
                                Don't have an account? 
                                <button 
                                    onClick={handleRegisterClick} 
                                    className="link"
                                    type="button"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LoginPage;