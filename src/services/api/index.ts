import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageRole } from '../../store';

const API_BASE_URL = 'http://localhost:8000'; 
const APP_NAME = 'multi_tool_agent'; 
const USER_ID = 'frontend_user'; 
const SESSION_ID_KEY = 'multiToolAgentSessionId';

const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  // If no session ID is found, create a new one and store it
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    createSession(sessionId);
  }
  return sessionId;
};

const createSession = async (sessionId: string) => {
  try {
    await axios.post(`${API_BASE_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`);
    console.log(`Session ${sessionId} created or ensured.`);
  } catch (error) {
    console.error('Error creating session:', error);
  }
};

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

export const chatApi = {
  text: async (messages: Pick<Message, 'role' | 'content'>[]): Promise<{ role: MessageRole; content: string }> => {
    const sessionId = getSessionId();

    // await createSession(sessionId);

    const latestUserMessage = messages.findLast(m => m.role === 'user')?.content || '';

    if (!latestUserMessage) {
      // Handle case where there's no user message? Maybe return an error or default message.
      // For now, let's throw an error, assuming the UI ensures a message exists.
      throw new Error("No user message found to send.");
    }

    const requestPayload: RunApiRequest = {
      app_name: APP_NAME,
      user_id: USER_ID,
      session_id: sessionId,
      new_message: {
        role: 'user',
        parts: [{ text: latestUserMessage }],
      },
    };

    try {
      const response = await axios.post<ApiResponseEvent[]>(`${API_BASE_URL}/run`, requestPayload);
      const apiResponseEvents = response.data;

      // Find the last relevant message from the model
      // Based on the example, the final answer seems to be the last event
      // with role 'model' and a 'text' part, without a 'functionCall'.
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
      // Handle different types of errors (network, API errors, etc.)
      if (axios.isAxiosError(error)) {
        // Access specific Axios error details
        console.error('API Error Response:', error.response?.data);
        // Return a user-friendly error message
        return {
          role: 'assistant',
          content: `Sorry, there was an error communicating with the agent: ${error.message}`,
        };
      }
      // Generic error
      return {
        role: 'assistant',
        content: 'Sorry, an unexpected error occurred.',
      };
    }
  },
}; 