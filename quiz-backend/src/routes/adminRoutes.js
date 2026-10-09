import { Router } from 'express';
import {
  getDashboardOverview,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserDetailedReport,
  createSemester,
  updateSemester,
  deleteSemester,
  createSubject,
  updateSubject,
  deleteSubject,
  createChapter,
  updateChapter,
  deleteChapter,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminSemesterRequests,
  reviewSemesterRequest
} from '../controllers/adminController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect ALL admin routes with verifyToken AND requireAdmin
router.use(verifyToken, requireAdmin);

// 1. Dashboard Overview
router.get('/overview', getDashboardOverview);

// 2. User Management
router.get('/users', getUsers);
router.get('/users/:id/details', getUserDetailedReport);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 3. Academic Hierarchy
router.post('/semesters', createSemester);
router.put('/semesters/:id', updateSemester);
router.delete('/semesters/:id', deleteSemester);

router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.post('/chapters', createChapter);
router.put('/chapters/:id', updateChapter);
router.delete('/chapters/:id', deleteChapter);

// 4. Question Bank
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// 5. Semester Change Requests
router.get('/semester-requests', getAdminSemesterRequests);
router.put('/semester-requests/:id', reviewSemesterRequest);

export default router;
