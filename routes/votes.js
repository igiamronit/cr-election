const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { votingKeys, candidates, votes, sessions } = require('../utils/fileStorage');

// Middleware to verify voting token
const verifyVotingToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token, authorization denied'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.voter = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Cast a vote
router.post('/cast', verifyVotingToken, async (req, res) => {
  try {
    const { candidateId } = req.body;
    
    // Check if voting session is active
    const session = await sessions.getActive();
    if (!session || !session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Voting session is not active'
      });
    }
    
    // Verify candidate exists
    const allCandidates = await candidates.getAll();
    const candidate = allCandidates.find(c => c._id === candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
    
    // Hash the voting key for anonymity
    const keyHash = bcrypt.hashSync(req.voter.votingKey, 10);
    
    // Check if this key has already voted
    const existingVote = await votes.findByKeyHash(keyHash);
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'This key has already been used to vote'
      });
    }
    
    // Mark the voting key as used
    await votingKeys.markAsUsed(req.voter.votingKey);
    
    // Create the vote record
    await votes.add(candidateId, keyHash);
    
    // Increment candidate vote count
    await candidates.incrementVote(candidateId);
    
    res.json({
      success: true,
      message: 'Vote cast successfully'
    });
    
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get voting results
router.get('/results', async (req, res) => {
  try {
    const allCandidates = await candidates.getAll();
    const activeSession = await sessions.getActive();
    const allSessions = await sessions.getAll();
    const sessionData = activeSession || (allSessions.length > 0 ? allSessions[allSessions.length - 1] : null);
    
    res.json({
      success: true,
      candidates: allCandidates.sort((a, b) => b.votes - a.votes),
      session: sessionData ? {
        _id: sessionData._id,
        isActive: sessionData.isActive,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        totalVotes: sessionData.totalVotes,
        createdAt: sessionData.createdAt
      } : { isActive: false, totalVotes: 0 }
    });
    
  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Session status endpoint
router.get('/session-status', async (req, res) => {
  try {
    const activeSession = await sessions.getActive();
    
    res.json({
      success: true,
      session: activeSession || { isActive: false },
      isActive: !!activeSession
    });
    
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
