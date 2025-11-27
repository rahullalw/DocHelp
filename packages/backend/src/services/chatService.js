import { GoogleGenAI } from "@google/genai";
import { getDoctorSystemPrompt, getAdvicePrompt, getChatPrompt } from '../prompts/doctorPersona.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// In-memory store for project contexts (use DB in production)
const projectContexts = new Map();

export const initializeProjectContext = (projectId, reportAnalysis) => {
  const persona = extractPersonaFromReport(reportAnalysis);
  projectContexts.set(projectId, {
    reportAnalysis,
    persona,
    conversationHistory: [],
    createdAt: new Date()
  });
  return persona;
};

export const getProjectContext = (projectId) => {
  return projectContexts.get(projectId) || null;
};

const extractPersonaFromReport = (analysis) => {
  return {
    name: analysis.patient_summary?.name || 'Patient',
    age: analysis.patient_summary?.age || null,
    reportType: analysis.patient_summary?.report_type || 'Medical Report',
    keyFindings: analysis.abnormal_findings?.slice(0, 5) || [],
    healthStatus: analysis.patient_summary?.overall_health_status || null
  };
};

export const generateAdvice = async (projectId) => {
  const context = projectContexts.get(projectId);
  if (!context) throw new Error('Project not found. Please upload a report first.');

  const prompt = getAdvicePrompt(context.reportAnalysis);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });

  const text = response.candidates[0].content.parts[0].text;
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { rawAdvice: text };
    }
  }
  return { rawAdvice: text };
};

export const chat = async (projectId, userMessage) => {
  const context = projectContexts.get(projectId);
  if (!context) throw new Error('Project not found. Please upload a report first.');

  const systemPrompt = getDoctorSystemPrompt(context.reportAnalysis, context.persona);
  const chatPrompt = getChatPrompt(userMessage, context.conversationHistory);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
    contents: chatPrompt
  });

  const aiResponse = response.candidates[0].content.parts[0].text;

  // Update conversation history (keep last 20 messages)
  context.conversationHistory.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: aiResponse }
  );
  if (context.conversationHistory.length > 40) {
    context.conversationHistory = context.conversationHistory.slice(-40);
  }

  return {
    response: aiResponse,
    persona: context.persona
  };
};

export const clearConversation = (projectId) => {
  const context = projectContexts.get(projectId);
  if (context) {
    context.conversationHistory = [];
    return true;
  }
  return false;
};

