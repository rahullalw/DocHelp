import express from 'express';
import multer from 'multer';
import { analyzeReport, testAnalysis } from '../controllers/analysisController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for file uploads.
// We use memoryStorage to temporarily hold the file in memory before processing.
// This avoids writing temporary files to disk.
const upload = multer({ storage: multer.memoryStorage() });

// Apply auth middleware to all routes
router.use(authMiddleware);

// Define the API route.
// POST /api/v1/analyze
// The `upload.single('report')` middleware processes a single file upload
// from a form field named 'report'.
router.post('/', upload.single('report'), analyzeReport);

// Define a new test route to analyze a saved input file.
// GET /api/v1/analyze/test
router.get('/test', testAnalysis);

export default router;
