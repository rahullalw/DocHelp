import fs from 'fs';
import path from 'path';
import { analyzeReportWithAI } from './analyzeReportWithAI.js';
import { cleanAndFormatText } from '../utils/textCleaner.js';
import { extractTextFromPDF } from '../utils/pdfExtractor.js';
import { validateMedicalReport } from './reportValidator.js';

// This service contains the core business logic for analyzing a report.

/**
 * Extract persona from report analysis
 */
const extractPersonaFromReport = (analysis) => {
  return {
    name: analysis.patient_summary?.name || 'Patient',
    age: analysis.patient_summary?.age || null,
    reportType: analysis.patient_summary?.report_type || 'Medical Report',
    keyFindings: analysis.abnormal_findings?.slice(0, 5) || [],
    healthStatus: analysis.patient_summary?.overall_health_status || null
  };
};

/**
 * Processes the uploaded medical report file.
 * Extracts text from PDF, formats it, and analyzes it using Gemini AI
 */
export const processReport = async (file) => {
  // 1. Check for the GEMINI_API_KEY environment variable.
  if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL: GEMINI_API_KEY is not defined in the environment variables.');
    throw new Error('Server configuration error. AI service endpoint is not set.');
  }

  console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);

  try {
    // 2. Extract text from the uploaded file
    let extractedText = '';
    
    if (file.mimetype === 'application/pdf') {
      // Parse PDF and extract text
      extractedText = await extractTextFromPDF(file.buffer);
      // saveInputs(extractedText); // Commented out - now saving to DB
      console.log('PDF text extracted successfully');
    } else if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      // Handle plain text files
      extractedText = file.buffer.toString('utf-8');
      console.log('Text file content extracted');
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
    }

    // 3. Clean and format the extracted text
    const cleanedText = cleanAndFormatText(extractedText);
    
    if (!cleanedText || cleanedText.trim().length < 10) {
      throw new Error('Unable to extract meaningful text from the file. Please ensure the file contains readable medical report content.');
    }

    console.log('Extracted text preview:', cleanedText.substring(0, 200) + '...');

    // 4. Validate it's actually a medical report (hybrid: keyword → LLM fallback)
    await validateMedicalReport(cleanedText);

    // 5. Analyze with AI
    const analysis = await analyzeReportWithAI(cleanedText);
    
    // 6. Extract persona from analysis
    const persona = extractPersonaFromReport(analysis);

    return { analysis, persona };

  } catch (error) {
    console.error('Error processing report:', error.message);
    throw error;
  }
};



const saveInputs = (inputText) => {
  try {
    const inputsDir = path.join(process.cwd(), 'gemini-inputs');
    if (!fs.existsSync(inputsDir)) {
      fs.mkdirSync(inputsDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(inputsDir, `input-${timestamp}.txt`);

    fs.writeFileSync(filePath, inputText, 'utf-8');
    console.log(`User input saved to: ${filePath}`);
  } catch (error) {
    console.error('Error saving user input:', error);
  }
};
