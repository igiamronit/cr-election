const mongoose = require('mongoose');

const VotingSessionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: null
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

module.exports = mongoose.model('VotingSession', VotingSessionSchema);
