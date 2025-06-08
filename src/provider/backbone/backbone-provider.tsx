import { z } from 'zod';
import { availableModels, agentChatResponse } from './backbone-schema';

export const listAvailableModels = async (): Promise<z.infer<typeof availableModels>> => {
  const response = await fetch(`${process.env.BACKEND_URL}/list-available-models`);
  const data = await response.json();
  return availableModels.parse(data);
};

export const setBackboneModel = async (model: string): Promise<z.infer<typeof availableModels>> => {
  const response = await fetch(`${process.env.BACKEND_URL}/set-backbone-model`, {
    method: 'POST',
    body: JSON.stringify({ model }),
  });
  const data = await response.json();
  return availableModels.parse(data);
};

export const invokeAgentChat = async (userId: string, message: string, files?: File[]): Promise<z.infer<typeof agentChatResponse>> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, prompt: message, files }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return agentChatResponse.parse(data);
  } catch (error) {
    console.error('Error in invokeAgentChat:', error);
    return { response: 'Sorry, there was an error processing your request.' };
  }
};