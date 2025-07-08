import React, { useState, useEffect } from 'react';
import '../css/LandingPage.css'
import Navbar from './Navbar';
export default function LandingPage() {

  return (
    <div className="landing-container">
      <Navbar />
      {/* Animated background elements */}
      <div className="background-elements">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

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