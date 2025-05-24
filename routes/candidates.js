const express = require('express');
const router = express.Router();

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const candidates = await Candidate.find().sort({ position: 1 });
    
    res.json({
      success: true,
      candidates
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get candidate by ID
router.get('/:id', async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
    
    res.json({
      success: true,
      candidate
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
