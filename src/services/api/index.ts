import axios from 'axios';
import { Message, MessageRole } from '../../store';

interface RunApiRequest {
  app_name: string;
  user_id: string;
  session_id: string;
  new_message: {
    role: 'user';
    parts: { text: string }[];
  };
}

interface ApiResponseEvent {
  content: {
    parts: (
      | { text: string }
      | { functionCall: { id: string; args: Record<string, unknown>; name: string } }
      | { functionResponse: { id: string; name: string; response: Record<string, unknown> } }
    )[];
    role: 'model' | 'user' | 'tool';
  };
  author: string;
  id: string;
  timestamp: number;
  invocation_id: string;
  actions: Record<string, unknown>;
  long_running_tool_ids?: string[]; 
}

const API_BASE_URL = 'http://localhost:8000'; 
const APP_NAME = 'multi_tool_agent'; 
const USER_ID = 'frontend_user'; 

export const createSession = async (userId: string, sessionId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error);
  }
};

export const chatApi = {
  text: async (userId: string, sessionId: string, message: Pick<Message, 'role' | 'content'>): Promise<{ role: MessageRole; content: string }> => {
    if (!message) {
      throw new Error("No user message found to send.");
    }

    const requestPayload: RunApiRequest = {
      app_name: APP_NAME,
      user_id: USER_ID,
      session_id: sessionId,
      new_message: {
        role: 'user',
        parts: [{ text: message.content }],
      },
    };

    try {
      const response = await axios.post<ApiResponseEvent[]>(`${API_BASE_URL}/run`, requestPayload);
      const apiResponseEvents = response.data;
      let finalMessage = "Sorry, I couldn't get a response."; // Default fallback

      for (let i = apiResponseEvents.length - 1; i >= 0; i--) {
          const event = apiResponseEvents[i];
          if (event.content.role === 'model' && event.content.parts.some(part => 'text' in part) && !event.content.parts.some(part => 'functionCall' in part)) {
              const textPart = event.content.parts.find(part => 'text' in part) as { text: string } | undefined;
              if (textPart) {
                  finalMessage = textPart.text;
                  break; // Found the most recent model text response
              }
          }
      }

      return {
        role: 'assistant',
        content: finalMessage,
      };
    } catch (error) {
      console.error('Error calling Multi-Tool Agent API:', error);

      if (axios.isAxiosError(error)) {
        console.error('API Error Response:', error.response?.data);

        return {
          role: 'assistant',
          content: `Sorry, there was an error communicating with the agent: ${error.message}`,
        };
      }

      return {
        role: 'assistant',
        content: 'Sorry, an unexpected error occurred.',
      };
    }
  },
}; 