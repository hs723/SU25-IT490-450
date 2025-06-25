import React, { useState, useEffect } from 'react';
import './LandingPage.css';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-container">
      {/* Animated background elements */}
      <div className="background-elements">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      {/* Navigation */}
      <nav className={`navbar ${scrollY > 50 ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo">
              Trivia
            </div>
            
            {/* Navigation Menu */}
            <div className="nav-menu">
              <a href="/profile" className="nav-link">Profile</a>
              <a href="/logout" className="nav-link">Logout</a>
              <a href="/register" className="nav-button">
                Register
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="trust-badge">
            <span>Try our many different Trivia Games!
            </span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line-1">HOW SMART</span>
            <br />
            <span className="title-line-2">ARE YOU?</span>
          </h1>
          
          <p className="hero-description">
            Test to see how much you know by yourself or with a group of friends
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary">
              Play NOW
            </button>
            <button className="btn-secondary">
              Create Party
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}