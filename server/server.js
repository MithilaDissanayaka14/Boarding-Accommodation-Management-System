require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Validated environment and logger
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const connectDB = require('./src/config/db');

// Middlewares
const notFound = require('./src/middlewares/notFound');
const errorHandler = require('./src/middlewares/errorHandler');

// Initialize Express App
const app = express();

// Trust reverse proxy (useful for rate-limiting behind proxies/Render/Nginx)
app.set('trust proxy', 1);

// 1. HTTP Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl/Postman in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Request Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// 4. Rate Limiting on Authentication Endpoints (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 100 : 20, // generous in dev, strict in prod
  message: {
    status: 'fail',
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// 5. Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// 6. Gzip Compression
app.use(compression());

// 7. Static Media Serving (Local Uploads fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 8. Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Boarding Accommodation Management API is operational',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 9. API Routes Registration
app.use('/api/v1/auth', require('./src/routes/authRoutes'));
app.use('/api/v1/listings', require('./src/routes/listingRoutes'));
app.use('/api/v1/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/v1/invoices', require('./src/routes/invoiceRoutes'));
app.use('/api/v1/maintenance', require('./src/routes/maintenanceRoutes'));
app.use('/api/v1/reviews', require('./src/routes/reviewRoutes'));

// 10. 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

// Server Startup
const PORT = env.PORT || 5000;

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    logger.info(`==================================================`);
    logger.info(`🚀 BAMS Backend Server running on port ${PORT}`);
    logger.info(`📡 Client URL: ${env.CLIENT_URL}`);
    logger.info(`⚙️  Environment: ${env.NODE_ENV}`);
    logger.info(`==================================================`);
  });
};

// Graceful Shutdown Handlers
const handleShutdown = (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

startServer();

module.exports = app;
