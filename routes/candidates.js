const express = require('express');
const router = express.Router();
const { candidates } = require('../utils/fileStorage');

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const allCandidates = await candidates.getAll();
    
    res.json({
      success: true,
      candidates: allCandidates
    });
    
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
