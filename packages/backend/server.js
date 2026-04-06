// This is the entry point for our backend application.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import analysisRoutes from './src/api/routes/analysisRoutes.js';
import chatRoutes from './src/api/routes/chatRoutes.js';
import userRoutes from './src/api/routes/userRoutes.js';
import adminRoutes from './src/api/routes/adminRoutes.js';

// Initialize the Express application
const app = express();

// Define the port. Use the environment variable or default to 3001.
const PORT = process.env.PORT || 3001;

// --- Middleware Setup ---

// 1. CORS (Cross-Origin Resource Sharing)
// Allow requests from our frontend
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

// 2. JSON Body Parser
app.use(express.json());

// 3. Clerk Middleware - MUST be before routes
// This attaches auth info to request that getAuth() can read
app.use(clerkMiddleware());

// --- API Routes ---

// User routes (auth status, limits, projects)
app.use('/api/v1/user', userRoutes);

// Admin routes (super user only)
app.use('/api/v1/admin', adminRoutes);

// All routes related to analysis are handled by this router.
app.use('/api/v1/analyze', analysisRoutes);

// Chat routes
app.use('/api/v1/chat', chatRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Start the Server ---

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
