import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  redeemAccessCode,
  createSemesterRequest,
  getMySemesterRequests
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { authRateLimiter } from '../config/security.js';

const router = Router();

// Public auth endpoints (with rate limiting)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/redeem-code', redeemAccessCode);

// Protected endpoints
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);

// Semester Request Workflow (for students)
router.post('/semester-request', verifyToken, createSemesterRequest);
router.get('/semester-request', verifyToken, getMySemesterRequests);
router.get('/semester-requests', verifyToken, getMySemesterRequests);

export default router;
