const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token, authorization denied'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Admin login endpoint - simplified to use .env password
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Simple check against .env values
    if (username !== 'admin' || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { isAdmin: true, username: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Generate voting keys
router.post('/generate-keys', verifyAdmin, async (req, res) => {
  try {
    const VotingKey = require('../models/VotingKey');
    
    // Clear existing keys
    await VotingKey.deleteMany({});
    
    // Generate 36 unique keys
    const keys = [];
    for (let i = 0; i < 36; i++) {
      const key = crypto.randomBytes(16).toString('hex');
      keys.push({ key });
    }
    
    await VotingKey.insertMany(keys);
    
    const allKeys = await VotingKey.find({}, 'key');
    
    res.json({
      success: true,
      message: '36 voting keys generated successfully',
      keys: allKeys.map(k => k.key)
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all voting keys with status
router.get('/keys', verifyAdmin, async (req, res) => {
  try {
    const VotingKey = require('../models/VotingKey');
    const keys = await VotingKey.find({});
    
    res.json({
      success: true,
      keys
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create/Update candidates
router.post('/candidates', verifyAdmin, async (req, res) => {
  try {
    const { candidates } = req.body;
    const Candidate = require('../models/Candidate');
    
    if (!candidates || !Array.isArray(candidates) || candidates.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide up to 3 candidates'
      });
    }
    
    // Clear existing candidates
    await Candidate.deleteMany({});
    
    // Create new candidates
    const newCandidates = candidates.map((candidate, index) => ({
      name: candidate.name,
      description: candidate.description || '',
      photo: candidate.photo || '',
      position: index + 1,
      votes: 0
    }));
    
    await Candidate.insertMany(newCandidates);
    
    res.json({
      success: true,
      message: 'Candidates updated successfully',
      candidates: newCandidates
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Start/Stop voting session
router.post('/voting-session', verifyAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    const VotingSession = require('../models/VotingSession'); // Fixed path - removed the dot
    
    console.log(`Voting session ${action} requested`); // Debug log
    
    if (action === 'start') {
      // First, end any existing active sessions
      await VotingSession.updateMany(
        { isActive: true }, 
        { 
          isActive: false, 
          endTime: new Date() 
        }
      );
      
      // Create new session
      const newSession = new VotingSession({
        isActive: true,
        startTime: new Date(),
        totalVotes: 0
      });
      
      await newSession.save();
      
      console.log('New voting session created:', newSession._id); // Debug log
      
      res.json({
        success: true,
        message: 'Voting session started successfully',
        session: newSession
      });
      
    } else if (action === 'stop') {
      // Find and stop the active session
      const activeSession = await VotingSession.findOne({ isActive: true });
      
      if (!activeSession) {
        return res.status(400).json({
          success: false,
          message: 'No active voting session found'
        });
      }
      
      activeSession.isActive = false;
      activeSession.endTime = new Date();
      await activeSession.save();
      
      console.log('Voting session stopped:', activeSession._id); // Debug log
      
      res.json({
        success: true,
        message: 'Voting session stopped successfully',
        session: activeSession
      });
      
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use "start" or "stop"'
      });
    }
    
  } catch (error) {
    console.error('Voting session control error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get voting statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const VotingKey = require('../models/VotingKey');
    const Vote = require('../models/Vote');
    const Candidate = require('../models/Candidate');
    const VotingSession = require('../models/VotingSession'); // Fixed path
    
    const totalKeys = await VotingKey.countDocuments();
    const usedKeys = await VotingKey.countDocuments({ used: true });
    const totalVotes = await Vote.countDocuments();
    const candidates = await Candidate.find().sort({ votes: -1 });
    const currentSession = await VotingSession.findOne().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      stats: {
        totalKeys,
        usedKeys,
        remainingKeys: totalKeys - usedKeys,
        totalVotes,
        candidates,
        currentSession: currentSession || null
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Reset all data
router.post('/reset', verifyAdmin, async (req, res) => {
  try {
    const VotingKey = require('../models/VotingKey');
    const Vote = require('../models/Vote');
    const Candidate = require('../models/Candidate');
    const VotingSession = require('../models/VotingSession'); // Fixed path
    
    // Clear all data
    await Promise.all([
      VotingKey.deleteMany({}),
      Vote.deleteMany({}),
      Candidate.deleteMany({}),
      VotingSession.deleteMany({})
    ]);
    
    res.json({
      success: true,
      message: 'All data reset successfully'
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
