// This is the entry point for our backend application.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './src/api/routes/analysisRoutes.js';
import chatRoutes from './src/api/routes/chatRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Define the port. Use the environment variable or default to 3001.
const PORT = process.env.PORT || 3001;

// --- Middleware Setup ---

// 1. CORS (Cross-Origin Resource Sharing)
// This is a crucial security feature. We only allow requests from our frontend.
const corsOptions = {
  origin: 'http://localhost:5173', // The origin of the frontend app
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// 2. JSON Body Parser
// This allows the server to accept and parse JSON in request bodies.
app.use(express.json());

// --- API Routes ---

// All routes related to analysis are handled by this router.
// This keeps our server.js file clean and modular.
app.use('/api/v1/analyze', analysisRoutes);
app.use('/api/v1/chat', chatRoutes);

// --- Global Error Handler ---
// A simple catch-all for errors.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Start the Server ---

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
