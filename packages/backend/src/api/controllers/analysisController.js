import { processReport } from '../../services/analysisService.js';
import { analyzeWithGemini } from '../../services/analyzeGemini.js';
import fs from 'fs/promises';
import path from 'path';

export const analyzeReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please provide a report.' });
    }
    const result = await processReport(req.file);

    return res.status(200).json({ 
      message: 'Analysis successful',
      projectId: result.projectId,
      analysis: result.analysis,
      persona: result.persona
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
