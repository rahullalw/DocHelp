import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import { saveAiResponse, saveFullResponse } from '../utils/responseSaver.js';
import { extractJsonFromText } from '../utils/textCleaner.js';
import { getMedicalReportPrompt } from '../prompts/medicalReportPrompt.js';

// Load environment variables
dotenv.config();

// Initialize the Gemini AI client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const analyzeWithGemini = async (reportText) => {
  const medicalPrompt = getMedicalReportPrompt(reportText);

  try {
    // Call Gemini AI to analyze the medical report
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: medicalPrompt,
    });

    // Save responses for debugging
    saveAiResponse(response.candidates[0].content.parts[0].text);
    saveFullResponse(response);

    // Extract and parse the JSON response
    try {
      const rawText = response.candidates[0].content.parts[0].text;
      const cleanedJson = extractJsonFromText(rawText);
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Return error response if JSON parsing fails
      return {
        patient_summary: {
          report_type: "Analysis Failed",
          overall_health_status: "Could not parse the AI's response."
        },
        abnormal_findings: [],
        health_concerns: [],
        recommendations: [{
          category: "Error",
          recommendation: "The AI response was not in a valid JSON format. Please check the saved response file.",
          priority: "High",
        }],
        follow_up_care: {},
        raw_ai_response: response,
        confidence_score: 0.1
      };
    }
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

export { analyzeWithGemini };