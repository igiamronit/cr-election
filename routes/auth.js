const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { votingKeys } = require('../utils/fileStorage');
const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    if (username !== 'admin' || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { isAdmin: true, username: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      message: 'Admin login successful'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Validate voting key
router.post('/validate-key', async (req, res) => {
  try {
    const { key, votingKey } = req.body;
    const keyToValidate = key || votingKey;
    
    console.log('Key validation request:', { key, votingKey, keyToValidate });
    
    if (!keyToValidate || keyToValidate.length !== 32) {
      return res.status(400).json({
        success: false,
        message: 'Invalid key format - key must be exactly 32 characters'
      });
    }
    
    const foundKey = await votingKeys.findByKey(keyToValidate.trim());
    
    console.log('Key lookup result:', foundKey ? 'Found' : 'Not found');
    
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
