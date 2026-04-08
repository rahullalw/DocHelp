import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import { getMedicalReportPrompt, MEDICAL_ANALYSIS_SYSTEM_INSTRUCTION } from '../prompts/medicalReportPrompt.js';
import { medicalReportSchema } from '../prompts/analysisSchema.js';

// Load environment variables
dotenv.config();

// Initialize the Gemini AI client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const analyzeWithGemini = async (reportText) => {
  const userPrompt = getMedicalReportPrompt(reportText);

  try {
    const startTime = Date.now();

    // Call Gemini AI with structured output config
    // Docs: https://ai.google.dev/gemini-api/docs/structured-output
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: MEDICAL_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: medicalReportSchema,
        temperature: 0.1,
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Gemini analysis completed in ${elapsed}s`);

    // Check if the response was truncated
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') {
      console.error('Gemini response was truncated (MAX_TOKENS). Consider increasing maxOutputTokens.');
      throw new Error('AI response was truncated. The report may be too complex.');
    }

    // With JSON mode, response.text is guaranteed valid JSON (if not truncated)
    const rawText = response.text;
    const analysisResult = JSON.parse(rawText);
    return analysisResult;

  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

export { analyzeWithGemini };