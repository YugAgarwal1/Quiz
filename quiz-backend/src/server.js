import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { corsOptions, helmetMiddleware, apiRateLimiter } from './config/security.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeDatabase } from './scripts/initDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database tables on server boot
initializeDatabase();

// 1. Security Headers
app.use(helmetMiddleware);

// 2. CORS Handling
app.use(cors(corsOptions));

// 3. Request Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Global API Rate Limiting
app.use('/api', apiRateLimiter);

// 5. Mount API Routes
app.use('/api', apiRouter);

// 6. Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🦅 Quiz Bird API Server is Running!',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      academics: '/api/academics',
      quiz: '/api/quiz',
      admin: '/api/admin'
    }
  });
});

// 7. 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found.`
  });
});

// 8. Global Error Handler Middleware
app.use(errorHandler);

// Start listening
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Quiz Bird Backend Server started on port ${PORT}`);
  console.log(`🌐 API base URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('====================================================');
});
