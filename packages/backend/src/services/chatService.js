import { GoogleGenAI } from "@google/genai";
import { getDoctorSystemPrompt, getAdvicePrompt, getInitialSummaryPrompt } from '../prompts/doctorPersona.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Store active chat sessions by project ID
const chatSessions = new Map();

/**
 * Get or create a chat session for a project
 * @param {Object} project - The project containing report analysis
 * @returns {Object} - The chat session
 */
const getOrCreateChatSession = (project) => {
  const projectId = project.id || project._id;
  
  if (!chatSessions.has(projectId)) {
    const systemPrompt = getDoctorSystemPrompt(project.reportAnalysis, project.persona);
    
    // Build history from existing conversation if available
    const history = (project.conversationHistory || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      history: history
    });
    
    chatSessions.set(projectId, chat);
  }
  
  return chatSessions.get(projectId);
};

/**
 * Clear chat session for a project (call when project context changes)
 * @param {string} projectId - The project ID
 */
export const clearChatSession = (projectId) => {
  chatSessions.delete(projectId);
};

/**
 * Generate initial summary when project is opened
 * @param {Object} project - The project containing report analysis
 * @returns {Promise<string>} - The AI summary
 */
export const generateInitialSummary = async (project) => {
  const systemPrompt = getDoctorSystemPrompt(project.reportAnalysis, project.persona);
  const summaryPrompt = getInitialSummaryPrompt(project.persona);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
    contents: summaryPrompt
  });

  return response.candidates[0].content.parts[0].text;
};

/**
 * Generate chat response using AI with persistent chat session
 * @param {Object} project - The project containing report analysis and conversation history
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
export const chatWithAI = async (project, userMessage) => {
  const chat = getOrCreateChatSession(project);
  
  console.log(`UserMessage:---------------------------------------- ${userMessage}`);
  
  const response = await chat.sendMessage({
    message: userMessage,
  });
  
  console.log(`Response:---------------------------------------- ${response.text}`);
  return response.text;
};

/**
 * Generate medical advice from AI based on report analysis
 * @param {Object} reportAnalysis - The analyzed report data
 * @returns {Promise<Object>} - Structured advice
 */
export const generateAdviceFromAI = async (reportAnalysis) => {
  const prompt = getAdvicePrompt(reportAnalysis);

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

// Legacy exports for backwards compatibility (if needed)
export const initializeProjectContext = () => {
  console.warn('initializeProjectContext is deprecated. Use userStore instead.');
};

export const getProjectContext = () => {
  console.warn('getProjectContext is deprecated. Use userStore instead.');
  return null;
};

export const generateAdvice = generateAdviceFromAI;
export const chat = chatWithAI;
export const clearConversation = (projectId) => {
  if (projectId) {
    clearChatSession(projectId);
    return true;
  }
  console.warn('clearConversation requires a projectId.');
  return false;
};
