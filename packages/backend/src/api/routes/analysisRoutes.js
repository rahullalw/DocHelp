import express from 'express';
import multer from 'multer';
import { analyzeReport } from '../controllers/analysisController.js';

const router = express.Router();

// Configure Multer for file uploads.
// We use memoryStorage to temporarily hold the file in memory before processing.
// This avoids writing temporary files to disk.
const upload = multer({ storage: multer.memoryStorage() });

// Define the API route.
// POST /api/v1/analyze
// The `upload.single('report')` middleware processes a single file upload
// from a form field named 'report'.
router.post('/', upload.single('report'), analyzeReport);

export default router;
