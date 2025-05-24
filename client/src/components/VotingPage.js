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
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    checkVotingSession();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/candidates');
      setCandidates(response.data.candidates);
    } catch (error) {
      setMessage('Error fetching candidates');
    }
  };

  const checkVotingSession = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/votes/results');
      setVotingSession(response.data.session);
    } catch (error) {
      console.error('Error checking voting session:', error);
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
      const response = await axios.post('http://localhost:5000/api/auth/validate-key', {
        votingKey: votingKey.trim()
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
        'http://localhost:5000/api/votes/cast',
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

  if (!votingSession?.isActive) {
    return (
      <div className="container">
        <div className="card">
          <div className="header">
            <h1>🗳️ Voting</h1>
            <p>The voting session is currently not active</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => navigate('/')} className="btn">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🗳️ Cast Your Vote</h1>
          <p>Enter your voting key to access the ballot</p>
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
