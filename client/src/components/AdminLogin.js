import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setMessage('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('cr-election-production.up.railway.app/api/admin/login', {
        username: credentials.username.trim(),
        password: credentials.password.trim()
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🔧 Admin Login</h1>
          <p>Enter admin credentials to access the dashboard</p>
        </div>

        {message && (
          <div className="alert alert-error">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Back to Home
            </button>
          </div>
        </form>

        <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0 }}>
            <strong>Admin Access:</strong><br />
            Contact system administrator for login credentials.<br />
            <em>Credentials are configured in the server environment.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
