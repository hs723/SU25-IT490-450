import React, { useEffect, useState } from "react";
import Navbar from './Navbar';
import { getCurrentUser, isLoggedIn } from '../utils/auth';
import '../css/ProfilePage.css';

function ProfilePanel({ navigate }) {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in and get their data
        if (isLoggedIn()) {
            const user = getCurrentUser();
            setCurrentUser(user);
            setIsUserLoggedIn(true);
            if (user) {
                setFormData({
                    email: user.email || '',
                    username: user.name || '',
                    password: ''
                });
            }
        } else {
            // Redirect to login if not logged in
            navigate('login');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Profile updated:', formData);
    };

    return (
        <div className="profile-container">
            <Navbar navigate={navigate} />
            
            {/* Animated background elements */}
            <div className="background-elements">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
            </div>

            {/* Profile Section */}
            <section className="profile-section">
                <div className="profile-wrapper">
                    <div className="form-container">
                        <div className="profile-header">
                            <h2 className="profile-title">
                                {currentUser ? `Welcome, ${currentUser.name}!` : 'Profile Settings'}
                            </h2>
                            <p className="profile-subtitle">
                                {currentUser ? 'Update your account information' : 'Please log in to view your profile'}
                            </p>
                        </div>
                        
                        {isUserLoggedIn ? (
                            <form className="profile-form" onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <input 
                                        type="email" 
                                        name="email"
                                        placeholder="Email" 
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required 
                                        className="profile-input"
                                    />
                                </div>
                                
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        name="username" 
                                        placeholder="Name" 
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required 
                                        className="profile-input"
                                    />
                                </div>
                                
                                <div className="input-group">
                                    <input 
                                        type="password" 
                                        name="password"
                                        placeholder="New Password (leave blank to keep current)" 
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    />
                                </div>
                                
                                <button type="submit" className="profile-submit-btn">
                                    UPDATE PROFILE
                                </button>
                            </form>
                        ) : (
                            <div className="login-prompt">
                                <button 
                                    onClick={() => navigate('login')} 
                                    className="profile-submit-btn"
                                >
                                    GO TO LOGIN
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ProfilePanel;