// test-backend.js
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins (for testing)
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Backend is working!' });
});

// Simple login endpoint
app.post('/api/login', (req, res) => {
  console.log('Login endpoint hit with data:', req.body);
  res.json({ 
    success: true, 
    message: 'Test login worked!',
    user: { name: 'Test User', email: req.body.email }
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/test`);
});