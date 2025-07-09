import React, { useState, useEffect } from 'react';
import { isLoggedIn, getCurrentUser, logout } from '../utils/auth';
import '../css/Navbar.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    // Check login status
    const checkLoginStatus = () => {
      setUserLoggedIn(isLoggedIn());
      setCurrentUser(getCurrentUser());
    };

    // Initial check
    checkLoginStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlePlayNow = () => {
    if (userLoggedIn) {
      navigate('/play');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    setUserLoggedIn(false);
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-content">
          <button onClick={() => navigate('/')} className="logo">TriviaGame</button>
          
          <div className="nav-menu">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            
            {userLoggedIn ? (
              <>
                <button 
                  onClick={() => navigate('/profile')} 
                  className="nav-link"
                >
                  Profile
                </button>
                <span className="user-greeting">
                  Hi, {currentUser?.name || 'User'}!
                </span>
                <button 
                  onClick={handleLogout} 
                  className="nav-link"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="nav-link"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="nav-link"
                >
                  Register
                </button>
              </>
            )}
            
            <button onClick={handlePlayNow} className="nav-button">
              {userLoggedIn ? 'Play Now' : 'Sign In to Play'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}