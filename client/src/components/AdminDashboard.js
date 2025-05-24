import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [keys, setKeys] = useState([]);
  const [candidates, setCandidates] = useState([
    { name: '', description: '' },
    { name: '', description: '' },
    { name: '', description: '' }
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedKey, setCopiedKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    fetchStats();
    fetchKeys();
  }, [navigate]);

  const getAuthHeaders = () => ({
    headers: { 'x-auth-token': localStorage.getItem('adminToken') }
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get('https://cr-election-uk6a.onrender.com/api/admin/stats', getAuthHeaders());
      setStats(response.data.stats);
    } catch (error) {
      setMessage('Error fetching statistics');
    }
  };

  const fetchKeys = async () => {
    try {
      const response = await axios.get('https://cr-election-uk6a.onrender.com/api/admin/keys', getAuthHeaders());
      setKeys(response.data.keys);
    } catch (error) {
      setMessage('Error fetching keys');
    }
  };

  const generateKeys = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://cr-election-uk6a.onrender.com/api/admin/generate-keys', {}, getAuthHeaders());
      if (response.data.success) {
        setMessage('36 new voting keys generated successfully!');
        fetchKeys();
        fetchStats();
      }
    } catch (error) {
      setMessage('Error generating keys');
    } finally {
      setLoading(false);
    }
  };

  const copyKeyToClipboard = async (keyValue) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedKey(keyValue);
      setMessage(`Key copied to clipboard: ${keyValue.substring(0, 8)}...`);
      
      // Clear the copied key indicator after 2 seconds
      setTimeout(() => {
        setCopiedKey('');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
      setMessage('Failed to copy key to clipboard');
    }
  };

  const copyAllKeys = async () => {
    try {
      const availableKeys = keys.filter(k => !k.used);
      const keyList = availableKeys.map(k => k.key).join('\n');
      
      await navigator.clipboard.writeText(keyList);
      setMessage(`${availableKeys.length} available keys copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy keys:', error);
      setMessage('Failed to copy keys to clipboard');
    }
  };

  const downloadKeys = () => {
    const availableKeys = keys.filter(k => !k.used);
    const keyList = availableKeys.map((k, index) => `${index + 1}. ${k.key}`).join('\n');
    
    const blob = new Blob([keyList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voting-keys-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage(`${availableKeys.length} available keys downloaded as text file`);
  };

  const updateCandidates = async () => {
    const validCandidates = candidates.filter(c => c.name.trim());
    
    if (validCandidates.length === 0) {
      setMessage('Please add at least one candidate');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://cr-election-uk6a.onrender.com/api/admin/candidates',
        { candidates: validCandidates },
        getAuthHeaders()
      );
      
      if (response.data.success) {
        setMessage('Candidates updated successfully!');
        fetchStats();
      }
    } catch (error) {
      setMessage('Error updating candidates');
    } finally {
      setLoading(false);
    }
  };

  const toggleVotingSession = async (action) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://cr-election-uk6a.onrender.com/api/admin/voting-session',
        { action },
        getAuthHeaders()
      );
      
      if (response.data.success) {
        setMessage(`Voting session ${action}ed successfully!`);
        fetchStats();
      }
    } catch (error) {
      setMessage(`Error ${action}ing voting session`);
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    if (!window.confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://cr-election-uk6a.onrender.com/api/admin/reset', {}, getAuthHeaders());
      if (response.data.success) {
        setMessage('All data reset successfully!');
        fetchStats();
        fetchKeys();
      }
    } catch (error) {
      setMessage('Error resetting data');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleCandidateChange = (index, field, value) => {
    const newCandidates = [...candidates];
    newCandidates[index][field] = value;
    setCandidates(newCandidates);
  };

  if (!stats) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="admin-panel">
        <h1>🔧 Admin Dashboard</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>Manage voting system and monitor statistics</p>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') || message.includes('successfully') || message.includes('copied') || message.includes('downloaded') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? '' : 'btn-secondary'}`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`btn ${activeTab === 'candidates' ? '' : 'btn-secondary'}`}
        >
          👥 Candidates
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`btn ${activeTab === 'keys' ? '' : 'btn-secondary'}`}
        >
          🔑 Voting Keys
        </button>
        <button
          onClick={() => setActiveTab('session')}
          className={`btn ${activeTab === 'session' ? '' : 'btn-secondary'}`}
        >
          🗳️ Voting Session
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-section">
          <h2>📊 System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalKeys}</div>
              <div className="stat-label">Total Keys</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.usedKeys}</div>
              <div className="stat-label">Used Keys</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.remainingKeys}</div>
              <div className="stat-label">Remaining Keys</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalVotes}</div>
              <div className="stat-label">Total Votes</div>
            </div>
          </div>

          <h3>Current Results:</h3>
          {stats.candidates.length === 0 ? (
            <p>No candidates configured</p>
          ) : (
            <div className="results-grid">
              {stats.candidates.map((candidate, index) => (
                <div key={candidate._id} className="result-card">
                  <div className="vote-count">{candidate.votes}</div>
                  <div className="candidate-name">{candidate.name}</div>
                  <div className="candidate-description">{candidate.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="admin-section">
          <h2>👥 Manage Candidates</h2>
          <p>Configure up to 3 candidates for the election:</p>
          
          {candidates.map((candidate, index) => (
            <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h4>Candidate {index + 1}</h4>
              <div className="input-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={candidate.name}
                  onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                  placeholder="Enter candidate name"
                />
              </div>
              <div className="input-group">
                <label>Description:</label>
                <textarea
                  value={candidate.description}
                  onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                  placeholder="Enter candidate description"
                  rows={3}
                />
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'center' }}>
            <button onClick={updateCandidates} className="btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Candidates'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="admin-section">
          <h2>🔑 Voting Keys Management</h2>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button onClick={generateKeys} className="btn" disabled={loading}>
              {loading ? 'Generating...' : 'Generate New 36 Keys'}
            </button>
          </div>
          
          {keys.length === 0 ? (
            <p>No voting keys generated yet.</p>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p>Total Keys: {keys.length} | Used: {keys.filter(k => k.used).length} | Available: {keys.filter(k => !k.used).length}</p>
                <div>
                  <button 
                    onClick={copyAllKeys} 
                    className="btn btn-secondary" 
                    style={{ marginRight: '10px' }}
                    disabled={keys.filter(k => !k.used).length === 0}
                  >
                    📋 Copy All Available
                  </button>
                  <button 
                    onClick={downloadKeys} 
                    className="btn btn-secondary"
                    disabled={keys.filter(k => !k.used).length === 0}
                  >
                    💾 Download Keys
                  </button>
                </div>
              </div>
              
              <div className="keys-grid">
                {keys.map((key) => (
                  <div key={key._id} className={`key-item ${key.used ? 'used' : ''}`}>
                    <div className="key-header">
                      <span className="key-value">{key.key}</span>
                      {!key.used && (
                        <button 
                          onClick={() => copyKeyToClipboard(key.key)}
                          className={`copy-btn ${copiedKey === key.key ? 'copied' : ''}`}
                          title="Copy key to clipboard"
                        >
                          {copiedKey === key.key ? '✅' : '📋'}
                        </button>
                      )}
                    </div>
                    <small className="key-status">
                      {key.used ? `Used on ${new Date(key.usedAt).toLocaleString()}` : 'Available'}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'session' && (
        <div className="admin-section">
          <h2>🗳️ Voting Session Control</h2>
          
          {stats.currentSession ? (
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Status:</strong> {stats.currentSession.isActive ? '🟢 Active' : '🔴 Inactive'}</p>
              {stats.currentSession.startTime && (
                <p><strong>Started:</strong> {new Date(stats.currentSession.startTime).toLocaleString()}</p>
              )}
              {stats.currentSession.endTime && (
                <p><strong>Ended:</strong> {new Date(stats.currentSession.endTime).toLocaleString()}</p>
              )}
              <p><strong>Total Votes:</strong> {stats.currentSession.totalVotes}</p>
            </div>
          ) : (
            <p>No voting session created yet.</p>
          )}
          
          <div style={{ textAlign: 'center' }}>
            {!stats.currentSession?.isActive ? (
              <button
                onClick={() => toggleVotingSession('start')}
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Start Voting Session'}
              </button>
            ) : (
              <button
                onClick={() => toggleVotingSession('stop')}
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? 'Stopping...' : 'Stop Voting Session'}
              </button>
            )}
          </div>
          
          <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <h4 style={{ color: '#e74c3c' }}>Danger Zone</h4>
            <button
              onClick={resetAllData}
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset All Data'}
            </button>
            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '10px' }}>
              This will delete all votes, keys, candidates, and sessions. Cannot be undone!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
