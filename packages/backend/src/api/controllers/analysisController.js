import { processReport } from '../../services/analysisService.js';
import { analyzeWithGemini } from '../../services/analyzeGemini.js';
import { canCreateProject, addProject, getRemainingLimits } from '../../db/operations.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const analyzeReport = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user can create more projects
    const canCreate = await canCreateProject(user);
    if (!canCreate) {
      const limits = await getRemainingLimits(user);
      return res.status(403).json({ 
        message: req.isGuest 
          ? 'Guest users can only analyze 1 report. Please sign in for more.'
          : `You have reached the maximum of ${limits.maxProjects} projects. Please delete an existing project to create a new one.`,
        code: 'PROJECT_LIMIT_REACHED',
        limits
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please provide a report.' });
    }

    // Process the report
    const result = await processReport(req.file);

    // Create project in database
    const projectId = crypto.randomUUID();
    const project = await addProject(user, projectId, result.analysis, result.persona);

    if (!project) {
      return res.status(500).json({ message: 'Failed to create project' });
    }

    const limits = await getRemainingLimits(user);

    return res.status(200).json({ 
      message: 'Analysis successful',
      projectId: project.id,
      analysis: result.analysis,
      persona: result.persona,
      limits,
      guestSessionId: req.newGuestSessionId || null
    });

  } catch (error) {
    console.error('Error in analysisController:', error.message);
    return res.status(500).json({ message: error.message || 'An internal server error occurred.' });
  }
};

export const testAnalysis = async (req, res) => {
  try {
    const inputsDir = path.join(process.cwd(), 'gemini-inputs');
    const files = await fs.readdir(inputsDir);

    if (files.length === 0) {
      return res.status(404).json({ message: 'No input files found in gemini-inputs directory.' });
    }

    // Find the most recent file based on timestamp in the name
    const latestFile = files.sort().reverse()[0];
    const filePath = path.join(inputsDir, latestFile);
    
    console.log(`Analyzing latest input file: ${latestFile}`);

    const reportText = await fs.readFile(filePath, 'utf-8');

    const analysis = await analyzeWithGemini(reportText);

    return res.status(200).json({
      message: `Analysis successful for ${latestFile}`,
      analysis: analysis
    });

  } catch (error) {
    console.error('Error in testAnalysis controller:', error.message);
    return res.status(500).json({ message: error.message || 'An internal server error occurred during test analysis.' });
  }
};
