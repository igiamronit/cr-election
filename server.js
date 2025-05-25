const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sessions } = require('./utils/fileStorage');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://igiamronit.github.io',
    'https://igiamronit.github.io/cr-election',
    'http://localhost:3000',
    'https://cr-election-production.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// Routes
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

// Session status endpoint
app.get('/api/session-status', async (req, res) => {
  try {
    const activeSession = await sessions.getActive();
    
    console.log('Session status check - active session found:', !!activeSession);
    
    res.json({
      success: true,
      isActive: !!activeSession,
      session: activeSession || { isActive: false }
    });
    
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      isActive: false
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
  console.log('Using file-based storage (no MongoDB required)');
});


