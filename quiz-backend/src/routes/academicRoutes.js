import { Router } from 'express';
import { getSemesters, getSubjects, getSubjectSyllabus } from '../controllers/academicController.js';

const router = Router();

router.get('/semesters', getSemesters);
router.get('/subjects', getSubjects);
router.get('/subjects/:subjectIdentifier/syllabus', getSubjectSyllabus);

export default router;
