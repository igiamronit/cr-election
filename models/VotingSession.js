const mongoose = require('mongoose');

const votingSessionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  totalVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure only one active session at a time
votingSessionSchema.index({ isActive: 1 });

module.exports = mongoose.model('VotingSession', votingSessionSchema);
