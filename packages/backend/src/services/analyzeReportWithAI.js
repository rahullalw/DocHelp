import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getMedicalReportPrompt, MEDICAL_ANALYSIS_SYSTEM_INSTRUCTION } from '../prompts/medicalReportPrompt.js';
import { medicalReportSchema } from '../prompts/analysisSchema.js';

// Load environment variables
dotenv.config();

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes a medical report using AI.
 */
const analyzeReportWithAI = async (reportText) => {
  const userPrompt = getMedicalReportPrompt(reportText);

  try {
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: process.env.AI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: MEDICAL_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: medicalReportSchema,
        temperature: 0.1,
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[AI] Report analysis completed in ${elapsed}s`);

    // Check if the response was truncated
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') {
      console.error('[AI] Response truncated (MAX_TOKENS).');
      throw new Error('AI response was truncated. The report may be too complex.');
    }

    // JSON mode guarantees valid JSON when not truncated
    const analysisResult = JSON.parse(response.text);
    return analysisResult;

  } catch (error) {
    console.error('[AI] Error analyzing report:', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

export { analyzeReportWithAI };
