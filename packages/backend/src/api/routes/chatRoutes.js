import express from 'express';
import { sendMessage, getAdvice, getContext, resetChat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/v1/chat - Send a message to Doctor AI
router.post('/', sendMessage);

// GET /api/v1/chat/advice/:projectId - Get medical advice for project
router.get('/advice/:projectId', getAdvice);

// GET /api/v1/chat/context/:projectId - Get project context and persona
router.get('/context/:projectId', getContext);

// DELETE /api/v1/chat/:projectId - Clear conversation history
router.delete('/:projectId', resetChat);

export default router;

