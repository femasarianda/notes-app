require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models/index');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',  require('./routes/auth.routes'));
app.use('/api/notes', require('./routes/notes.routes'));
app.use('/api/tags',  require('./routes/tags.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Inisialisasi DB hanya sekali
let isInitialized = false;

const initialize = async () => {
  if (!isInitialized) {
    await testConnection();
    await syncDatabase();
    isInitialized = true;
  }
};

// Wrap app untuk Vercel serverless
const handler = async (req, res) => {
  await initialize();
  return app(req, res);
};

// Export untuk Vercel serverless
module.exports = handler;

// Listen untuk lokal development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}