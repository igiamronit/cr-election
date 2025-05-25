import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VotingPage = () => {
  const [votingKey, setVotingKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [votingSession, setVotingSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    checkVotingSession();
    
    // Check session status every 10 seconds
    const interval = setInterval(checkVotingSession, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('cr-election-production.up.railway.app/api/candidates');
      if (response.data.success) {
        setCandidates(response.data.candidates);
      }
    } catch (error) {
      setMessage('Error fetching candidates');
    }
  };

  const checkVotingSession = async () => {
  try {
    setSessionLoading(true);
    const response = await axios.get('cr-election-production.up.railway.app/api/session-status');
    
    console.log('Session check response:', response.data); // Debug log
    
    if (response.data.success) {
      setVotingSession({
        isActive: response.data.isActive,
        ...response.data.session
      });
    } else {
      setVotingSession({ isActive: false });
    }
  } catch (error) {
    console.error('Error checking voting session:', error);
    setVotingSession({ isActive: false });
  } finally {
    setSessionLoading(false);
  }
};

  const validateKey = async (e) => {
    e.preventDefault();
    if (!votingKey.trim()) {
      setMessage('Please enter your voting key');
      return;
    }

    if (votingKey.length !== 32) {
      setMessage('Voting key must be exactly 32 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('cr-election-production.up.railway.app/api/auth/validate-key', {
        key: votingKey.trim() // Changed from votingKey to key to match backend
      });

      if (response.data.success) {
        localStorage.setItem('votingToken', response.data.token);
        setIsAuthenticated(true);
        setMessage('Key validated! Please select a candidate.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid voting key');
    } finally {
      setLoading(false);
    }
  };

  const castVote = async () => {
    if (!selectedCandidate) {
      setMessage('Please select a candidate');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('votingToken');
      const response = await axios.post(
        'cr-election-production.up.railway.app/api/votes/cast',
        { candidateId: selectedCandidate },
        { headers: { 'x-auth-token': token } }
      );

      if (response.data.success) {
        setMessage('Vote cast successfully! Thank you for voting.');
        localStorage.removeItem('votingToken');
        setTimeout(() => {
          navigate('/results');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error casting vote');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="container">
        <div className="card">
          <div className="header">
            <h1>🗳️ Voting</h1>
            <p>Checking voting session status...</p>
          </div>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!votingSession?.isActive) {
  console.log('Voting session not active:', votingSession); // Debug log
  
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🗳️ Voting</h1>
          <p>The voting session is currently not active</p>
          {/* Add debug info */}
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
            Debug: Session status = {JSON.stringify(votingSession)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/')} className="btn">
            ← Back to Home
          </button>
          <button 
            onClick={checkVotingSession} 
            className="btn btn-secondary"
            style={{ marginLeft: '10px' }}
          >
            🔄 Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}

  // Rest of your component remains the same...
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🗳️ Cast Your Vote</h1>
          <p>Enter your voting key to access the ballot</p>
          <div style={{ fontSize: '0.9rem', color: '#28a745' }}>
            ✅ Voting session is active
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {!isAuthenticated ? (
          <form onSubmit={validateKey}>
            <div className="voting-key-input">
              <div className="input-group">
                <label htmlFor="votingKey">Voting Key:</label>
                <input
                  type="text"
                  id="votingKey"
                  value={votingKey}
                  onChange={(e) => setVotingKey(e.target.value)}
                  placeholder="Enter your 32-character voting key"
                  maxLength={32}
                  style={{ fontFamily: 'monospace' }}
                />
                <small style={{ color: '#7f8c8d' }}>
                  Key length: {votingKey.length}/32
                </small>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Validating...' : 'Validate Key'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Select a Candidate:</h3>
            {candidates.length === 0 ? (
              <p>No candidates available for voting.</p>
            ) : (
              <div>
                {candidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={`candidate-card ${selectedCandidate === candidate._id ? 'selected' : ''}`}
                    onClick={() => setSelectedCandidate(candidate._id)}
                  >
                    <div className="candidate-name">{candidate.name}</div>
                    {candidate.description && (
                      <div className="candidate-description">{candidate.description}</div>
                    )}
                  </div>
                ))}
                
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={castVote}
                    className="btn btn-success"
                    disabled={loading || !selectedCandidate}
                  >
                    {loading ? 'Casting Vote...' : 'Cast Vote'}
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;