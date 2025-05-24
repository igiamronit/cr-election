const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anonymous-voting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully');
});

// Routes - with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/votes', require('./routes/votes'));
  app.use('/api/candidates', require('./routes/candidates'));
  app.use('/api/admin', require('./routes/admin'));
} catch (error) {
  console.error('Error loading routes:', error);
}

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Add this to your routes in server.js or create a new route file
app.get('/api/session-status', async (req, res) => {
  try {
    const VotingSession = require('./models/VotingSession');
    
    const activeSession = await VotingSession.findOne({ isActive: true });
    
    res.json({
      success: true,
      isActive: !!activeSession,
      session: activeSession || null
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
