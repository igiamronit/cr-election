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
    const { key, votingKey } = req.body; // Accept both parameter names
    const keyToValidate = key || votingKey; // Use whichever is provided
    
    console.log('Key validation request:', { key, votingKey, keyToValidate }); // Debug log
    
    if (!keyToValidate || keyToValidate.length !== 32) {
      return res.status(400).json({
        success: false,
        message: 'Invalid key format - key must be exactly 32 characters'
      });
    }
    
    const VotingKey = require('../models/VotingKey');
    const foundKey = await VotingKey.findOne({ key: keyToValidate.trim() });
    
    console.log('Key lookup result:', foundKey ? 'Found' : 'Not found'); // Debug log
    
    if (!foundKey) {
      return res.status(404).json({
        success: false,
        message: 'Invalid voting key'
      });
    }
    
    if (foundKey.used) {
      return res.status(400).json({
        success: false,
        message: 'This key has already been used'
      });
    }
    
    // Generate a temporary token for voting
    const token = jwt.sign(
      { keyId: foundKey._id, votingKey: keyToValidate },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      message: 'Key validated successfully'
    });
    
  } catch (error) {
    console.error('Key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
