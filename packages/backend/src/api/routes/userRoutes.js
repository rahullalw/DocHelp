import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { 
  getRemainingLimits, 
  getAllProjects,
  getProject,
  deleteProject,
  updateProjectDetails,
  USER_TYPE
} from '../../db/operations.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/v1/user/status - Get current user status and limits
router.get('/status', async (req, res) => {
  const user = req.user;
  
  if (!user) {
    return res.status(200).json({
      isAuthenticated: false,
      isGuest: false,
      user: null,
      limits: null
    });
  }

  const limits = await getRemainingLimits(user);
  const projects = await getAllProjects(user);

  res.status(200).json({
    isAuthenticated: req.isAuthenticated,
    isGuest: req.isGuest,
    guestSessionId: req.newGuestSessionId || null,
    user: {
      id: user.id,
      name: user.name || 'Guest',
      email: user.email || null,
      type: user.type
    },
    limits,
    projects
  });
});

// GET /api/v1/user/projects - Get all projects for current user
router.get('/projects', async (req, res) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const projects = await getAllProjects(user);
  res.status(200).json({ projects });
});

// GET /api/v1/user/projects/:projectId - Get specific project details
router.get('/projects/:projectId', async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;
  
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const project = await getProject(user, projectId);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.status(200).json({
    project: {
      id: project.id,
      name: project.name,
      reportAnalysis: project.reportAnalysis,
      persona: project.persona,
      conversationHistory: project.conversationHistory,
      chatCount: project.chatCount,
      createdAt: project.createdAt
    }
  });
});

// DELETE /api/v1/user/projects/:projectId - Delete a project
router.delete('/projects/:projectId', async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;
  
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const deleted = await deleteProject(user, projectId);
  
  if (!deleted) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.status(200).json({ message: 'Project deleted successfully' });
});

// PATCH /api/v1/user/projects/:projectId - Update project details
router.patch('/projects/:projectId', async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;
  const updates = req.body;
  
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const updated = await updateProjectDetails(user, projectId, updates);
  
  if (!updated) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.status(200).json({ 
    message: 'Project renamed successfully',
    project: updated
  });
});

export default router;
