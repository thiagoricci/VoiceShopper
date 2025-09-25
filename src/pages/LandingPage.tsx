import React from 'react';
import { Link } from 'react-router-dom';
import landingImage from '../assets/landing-hero.png'; // New landing page image

const LandingPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex items-center justify-center">
        <img src={landingImage} alt="Grocery shopping illustration" className="max-w-full h-auto" style={{ width: '400px' }} />
      </div>
      <div className="bg-white p-8 rounded-t-3xl shadow-lg flex-shrink-0">
        <h1 className="text-3xl font-bold text-center mb-4">Create a Shopping List Right from Your Phone</h1>
        <p className="text-gray-600 text-center mb-8">Now You Can Use Your Voice to Create a Shopping List</p>
        <Link to="/app" className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;