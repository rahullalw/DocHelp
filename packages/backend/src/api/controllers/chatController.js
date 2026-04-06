import { chatWithAI, generateAdviceFromAI, generateInitialSummary } from '../../services/chatService.js';
import { 
  getProject, 
  canSendChat, 
  addChatToProject, 
  clearConversationHistory,
  getRemainingLimits,
  LIMITS
} from '../../db/operations.js';

export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const { projectId, message } = req.body;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!projectId || !message) {
      return res.status(400).json({ message: 'projectId and message are required' });
    }

    // Get the project
    const project = await getProject(user, projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check chat limit for guests
    const canChat = await canSendChat(user, projectId);
    if (!canChat) {
      const limits = LIMITS[user.type];
      return res.status(403).json({ 
        message: req.isGuest 
          ? `Guest users are limited to ${limits.maxChatsPerProject} messages. Please sign in for unlimited chat.`
          : 'Chat limit reached for this project.',
        code: 'CHAT_LIMIT_REACHED',
        chatCount: project.chatCount,
        maxChats: limits.maxChatsPerProject
      });
    }

    // Generate AI response with full report context
    const aiResponse = await chatWithAI(project, message);

    // Store the chat
    await addChatToProject(user, projectId, message, aiResponse);

    // Get updated limits and updated project
    const limits = await getRemainingLimits(user);
    const updatedProject = await getProject(user, projectId);
    const chatLimits = LIMITS[user.type];

    return res.status(200).json({
      response: aiResponse,
      persona: project.persona,
      chatCount: updatedProject?.chatCount || 0,
      maxChats: chatLimits.maxChatsPerProject === Infinity ? 'unlimited' : chatLimits.maxChatsPerProject,
      limits
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getInitialSummary = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const project = await getProject(user, projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Generate initial AI summary with full report context
    const summary = await generateInitialSummary(project);

    return res.status(200).json({
      summary,
      persona: project.persona
    });
  } catch (error) {
    console.error('Initial summary error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getAdvice = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    const project = await getProject(user, projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const advice = await generateAdviceFromAI(project.reportAnalysis);
    return res.status(200).json({ advice });
  } catch (error) {
    console.error('Advice error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getContext = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const project = await getProject(user, projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const chatLimits = LIMITS[user.type];

    return res.status(200).json({
      persona: project.persona,
      messageCount: project.chatCount,
      maxChats: chatLimits.maxChatsPerProject === Infinity ? 'unlimited' : chatLimits.maxChatsPerProject,
      conversationHistory: project.conversationHistory
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetChat = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const cleared = await clearConversationHistory(user, projectId);
    
    if (!cleared) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ message: 'Conversation cleared' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
