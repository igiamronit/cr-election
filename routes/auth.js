const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        message: 'Admin login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Validate voting key
router.post('/validate-key', async (req, res) => {
  try {
    const { votingKey } = req.body;
    const VotingKey = require('../models/VotingKey');
    
    if (!votingKey || votingKey.length !== 32) {
      return res.status(400).json({
        success: false,
        message: 'Invalid key format'
      });
    }
    
    const key = await VotingKey.findOne({ key: votingKey });
    
    if (!key) {
      return res.status(404).json({
        success: false,
        message: 'Invalid voting key'
      });
    }
    
    if (key.used) {
      return res.status(400).json({
        success: false,
        message: 'This key has already been used'
      });
    }
    
    // Generate a temporary token for voting
    const token = jwt.sign(
      { keyId: key._id, votingKey: votingKey },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      message: 'Key validated successfully'
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
