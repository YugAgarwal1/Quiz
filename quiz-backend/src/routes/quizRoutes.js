import { Router } from 'express';
import {
  generateQuestions,
  submitQuiz,
  pauseQuiz,
  getQuizHistory,
  getAnalytics,
  logActiveTime,
  getAttemptById
} from '../controllers/quizController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Test generation (supports guest/local or authenticated users)
router.post('/generate', optionalAuth, generateQuestions);
router.post('/submit', optionalAuth, submitQuiz);
router.post('/pause', optionalAuth, pauseQuiz);

// User-specific routes (require authentication)
router.get('/history', verifyToken, getQuizHistory);
router.get('/attempts/:id', optionalAuth, getAttemptById);
router.get('/analytics', verifyToken, getAnalytics);
router.post('/log-time', verifyToken, logActiveTime);

export default router;
