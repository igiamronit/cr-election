import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
    
    // Auto-refresh results every 10 seconds
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('cr-election-production.up.railway.app/api/votes/results');
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = () => {
    return results?.candidates?.reduce((total, candidate) => total + candidate.votes, 0) || 0;
  };

  const getPercentage = (votes) => {
    const total = getTotalVotes();
    return total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
  };

  const getWinner = () => {
    if (!results?.candidates || results.candidates.length === 0) return null;
    return results.candidates.reduce((winner, candidate) => 
      candidate.votes > winner.votes ? candidate : winner
    );
  };

  if (loading) {
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
      <div className="card">
        <div className="header">
          <h1>📊 Voting Results</h1>
          <p>Live results from the anonymous voting system</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="stats-grid" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="stat-card">
              <div className="stat-number">{getTotalVotes()}</div>
              <div className="stat-label">Total Votes Cast</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{results?.candidates?.length || 0}</div>
              <div className="stat-label">Candidates</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{results?.session?.isActive ? '🟢' : '🔴'}</div>
              <div className="stat-label">Voting Status</div>
            </div>
          </div>
        </div>

        {results?.candidates && results.candidates.length > 0 ? (
          <div>
            {getTotalVotes() > 0 && (
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ color: '#2c3e50' }}>
                  🏆 Current Leader: {getWinner()?.name}
                </h3>
              </div>
            )}

            <div className="results-grid">
              {results.candidates
                .sort((a, b) => b.votes - a.votes)
                .map((candidate, index) => (
                  <div key={candidate._id} className="result-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        #{index + 1}
                      </span>
                      {index === 0 && getTotalVotes() > 0 && (
                        <span style={{ fontSize: '1.5rem' }}>🏆</span>
                      )}
                    </div>
                    
                    <div className="vote-count">{candidate.votes}</div>
                    <div className="candidate-name">{candidate.name}</div>
                    
                    {candidate.description && (
                      <div className="candidate-description" style={{ marginBottom: '10px' }}>
                        {candidate.description}
                      </div>
                    )}
                    
                    <div style={{ 
                      background: '#f8f9fa', 
                      borderRadius: '10px', 
                      padding: '5px 0',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      {getPercentage(candidate.votes)}%
                    </div>
                    
                    {/* Progress bar */}
                    <div style={{ 
                      background: '#ecf0f1', 
                      borderRadius: '10px', 
                      height: '8px',
                      marginTop: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: '100%',
                        width: `${getPercentage(candidate.votes)}%`,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No candidates available</h3>
            <p>The voting has not been set up yet.</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={() => navigate('/')} className="btn">
            ← Back to Home
          </button>
          
          <button onClick={fetchResults} className="btn btn-secondary">
            🔄 Refresh Results
          </button>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0 }}>
            Results update automatically every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
