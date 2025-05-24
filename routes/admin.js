const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { votingKeys, candidates, votes, sessions } = require('../utils/fileStorage');

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
    // Clear existing keys
    await votingKeys.deleteAll();
    
    // Generate 36 unique keys
    const keys = [];
    for (let i = 0; i < 36; i++) {
      const key = crypto.randomBytes(16).toString('hex');
      await votingKeys.add(key);
      keys.push(key);
    }
    
    res.json({
      success: true,
      message: '36 voting keys generated successfully',
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

// Get all voting keys with status
router.get('/keys', verifyAdmin, async (req, res) => {
  try {
    const allKeys = await votingKeys.getAll();
    
    res.json({
      success: true,
      keys: allKeys
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create/Update candidates
router.post('/candidates', verifyAdmin, async (req, res) => {
  try {
    const { candidates: candidatesList } = req.body;
    
    if (!candidatesList || !Array.isArray(candidatesList) || candidatesList.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide 1-3 candidates'
      });
    }
    
    const newCandidates = await candidates.replaceAll(candidatesList);
    
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
    
    console.log(`Voting session ${action} requested`);
    
    if (action === 'start') {
      const newSession = await sessions.create();
      
      console.log('New voting session created:', newSession._id);
      
      res.json({
        success: true,
        message: 'Voting session started successfully',
        session: newSession
      });
      
    } else if (action === 'stop') {
      const stoppedSession = await sessions.stop();
      
      if (!stoppedSession) {
        return res.status(400).json({
          success: false,
          message: 'No active voting session found'
        });
      }
      
      console.log('Voting session stopped:', stoppedSession._id);
      
      res.json({
        success: true,
        message: 'Voting session stopped successfully',
        session: stoppedSession
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
    const allKeys = await votingKeys.getAll();
    const allVotes = await votes.getAll();
    const allCandidates = await candidates.getAll();
    const currentSession = await sessions.getActive();
    
    const totalKeys = allKeys.length;
    const usedKeys = allKeys.filter(k => k.used).length;
    const totalVotes = allVotes.length;
    
    res.json({
      success: true,
      stats: {
        totalKeys,
        usedKeys,
        remainingKeys: totalKeys - usedKeys,
        totalVotes,
        candidates: allCandidates.sort((a, b) => b.votes - a.votes),
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
    await Promise.all([
      votingKeys.deleteAll(),
      votes.deleteAll(),
      candidates.deleteAll(),
      sessions.deleteAll()
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
