import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🗳️ Anonymous Voting Platform</h1>
          <p>Secure, anonymous voting system with 36 unique voter keys</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Link to="/vote" className="btn">
            🗳️ Cast Your Vote
          </Link>
          
          <Link to="/results" className="btn btn-secondary">
            📊 View Results
          </Link>
          
          <Link to="/admin" className="btn btn-secondary">
            🔧 Admin Panel
          </Link>
        </div>
        
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>How it works:</h3>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
              <strong>1.</strong> Each voter receives a unique 32-character voting key
            </p>
            <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
              <strong>2.</strong> Enter your key to access the voting page
            </p>
            <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
              <strong>3.</strong> Select your preferred candidate from up to 3 options
            </p>
            <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
              <strong>4.</strong> Each key can only be used once to ensure fair voting
            </p>
            <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
              <strong>5.</strong> All votes are anonymous and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
