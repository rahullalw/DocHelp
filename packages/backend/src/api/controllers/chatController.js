import { chat, generateAdvice, getProjectContext, clearConversation } from '../../services/chatService.js';

export const sendMessage = async (req, res) => {
  try {
    const { projectId, message } = req.body;
    
    if (!projectId || !message) {
      return res.status(400).json({ message: 'projectId and message are required' });
    }

    const result = await chat(projectId, message);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Chat error:', error.message);
    return res.status(error.message.includes('not found') ? 404 : 500).json({ message: error.message });
  }
};

export const getAdvice = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    const advice = await generateAdvice(projectId);
    return res.status(200).json({ advice });
  } catch (error) {
    console.error('Advice error:', error.message);
    return res.status(error.message.includes('not found') ? 404 : 500).json({ message: error.message });
  }
};

export const getContext = async (req, res) => {
  try {
    const { projectId } = req.params;
    const context = getProjectContext(projectId);
    
    if (!context) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({
      persona: context.persona,
      messageCount: context.conversationHistory.length / 2
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetChat = async (req, res) => {
  try {
    const { projectId } = req.params;
    const cleared = clearConversation(projectId);
    
    if (!cleared) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ message: 'Conversation cleared' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

