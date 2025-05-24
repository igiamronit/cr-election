const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    const VotingKey = require('../models/VotingKey');
    const Vote = require('../models/Vote');
    const Candidate = require('../models/Candidate');
    const VotingSession = require('../models/VotingSession');
    
    // Check if voting session is active
    const session = await VotingSession.findOne().sort({ createdAt: -1 });
    if (!session || !session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Voting session is not active'
      });
    }
    
    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
    
    // Hash the voting key for anonymity
    const keyHash = bcrypt.hashSync(req.voter.votingKey, 10);
    
    // Check if this key has already voted
    const existingVote = await Vote.findOne({ keyHash });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'This key has already been used to vote'
      });
    }
    
    // Mark the voting key as used
    await VotingKey.findByIdAndUpdate(req.voter.keyId, {
      used: true,
      usedAt: new Date()
    });
    
    // Create the vote record
    const vote = new Vote({
      candidateId,
      keyHash
    });
    
    await vote.save();
    
    // Increment candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, {
      $inc: { votes: 1 }
    });
    
    // Update session total votes
    await VotingSession.findByIdAndUpdate(session._id, {
      $inc: { totalVotes: 1 }
    });
    
    res.json({
      success: true,
      message: 'Vote cast successfully'
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get voting results
router.get('/results', async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const VotingSession = require('../models/VotingSession');
    
    const candidates = await Candidate.find().sort({ votes: -1 });
    const session = await VotingSession.findOne({ isActive: true }); // Only get active session
    const latestSession = await VotingSession.findOne().sort({ createdAt: -1 }); // Get latest for fallback
    
    res.json({
      success: true,
      candidates,
      session: session || latestSession || { totalVotes: 0, isActive: false }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add a specific endpoint to check session status
router.get('/session-status', async (req, res) => {
  try {
    const VotingSession = require('../models/VotingSession');
    
    const activeSession = await VotingSession.findOne({ isActive: true });
    
    res.json({
      success: true,
      session: activeSession || { isActive: false },
      isActive: !!activeSession
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
