import { Router } from 'express';
import authRoutes from './authRoutes.js';
import academicRoutes from './academicRoutes.js';
import quizRoutes from './quizRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/academics', academicRoutes);
apiRouter.use('/quiz', quizRoutes);
apiRouter.use('/admin', adminRoutes);

// Base API health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'QuizBird Node.js SQL Backend',
    version: '1.0.0'
  });
});

export default apiRouter;
