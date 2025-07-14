require('dotenv').config(); // Load environment variables FIRST
const express = require('express');
const cors = require('cors');
const connectDB = require('./config'); // Fixed path to db.js
const urlRoutes = require('./routes/urlRoutes');
const { Log } = require('../middleware/logger');

const app = express();

// Verify essential environment variables
const requiredEnvVars = ['PORT', 'MONGODB_URI', 'LOG_API_URL', 'AUTH_TOKEN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with error handling
connectDB().catch(err => {
  Log("backend", "fatal", "server", `Database connection failed: ${err.message}`);
  console.error('Database connection error:', err.message);
  process.exit(1);
});

// Routes
app.use('/shorturls', urlRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  Log("backend", "error", "server", `Unhandled error: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  Log("backend", "info", "server", `Server started on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  Log("backend", "fatal", "server", `Uncaught Exception: ${err.message}`);
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  Log("backend", "fatal", "server", `Unhandled Rejection: ${err.message}`);
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});