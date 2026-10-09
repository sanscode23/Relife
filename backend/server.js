const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const connectDB = require('./config/db');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const historyRoutes = require('./routes/historyRoutes');
const impactRoutes = require('./routes/impactRoutes');

// Middleware imports
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Database Connection
connectDB();

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed origins
    if (!origin || env.allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: Origin '${origin}' not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static upload files serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter
if (process.env.ENABLE_RATE_LIMIT !== 'false') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      details: [],
    },
  });
  app.use(env.PUBLIC_VERIFY_BASE_URL ? '/api' : '/api', limiter);
}

// API Routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', deviceRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', safetyRoutes);
app.use('/api', certificateRoutes);
app.use('/api', historyRoutes);
app.use('/api', impactRoutes);

// Root route welcome
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to RE:LIFE API Server. Health endpoint available at /api/health.',
  });
});

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

// Server startup
const PORT = env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RE:LIFE Server running on http://0.0.0.0:${PORT} in [${env.NODE_ENV}] mode`);
});

// Unhandled Promise Rejections & Signals
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => console.log('Process terminated.'));
});

module.exports = app;
