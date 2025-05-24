const mongoose = require('mongoose');

const VotingKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    length: 32
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VotingKey', VotingKeySchema);
