import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageRole } from './store';

const API_BASE_URL = 'http://localhost:8000'; // Base URL from documentation
const APP_NAME = 'multi_tool_agent'; // App name from documentation
const USER_ID = 'frontend_user'; // Using a fixed user ID for now
const SESSION_ID_KEY = 'multiToolAgentSessionId';

// Function to get or create a session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    // We might need to explicitly create the session on the backend if just sending
    // the ID isn't enough, but the /run endpoint seems to require it.
    // Let's try without explicit creation first, and add it if needed.
    // createSession(sessionId); // Potentially call createSession here
  }
  return sessionId;
};

// Optional: Function to explicitly create a session via the API
// This might be necessary depending on how the backend handles unknown session IDs.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createSession = async (sessionId: string) => {
  try {
    await axios.post(`${API_BASE_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`);
    console.log(`Session ${sessionId} created or ensured.`);
  } catch (error) {
    console.error('Error creating session:', error);
    // Handle error appropriately, maybe clear the stored session ID?
    // localStorage.removeItem(SESSION_ID_KEY);
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
  // The API doesn't seem to take the full history in the request based on docs
}

// Define the structure for the API response events based on integration.md
interface ApiResponseEvent {
  content: {
    parts: (
      | { text: string }
      | { functionCall: { id: string; args: Record<string, unknown>; name: string } }
      | { functionResponse: { id: string; name: string; response: Record<string, unknown> } }
    )[];
    role: 'model' | 'user' | 'tool'; // Assuming 'tool' might be possible too
  };
  author: string; // e.g., "main_agent", "file_system_agent"
  id: string;
  timestamp: number;
  invocation_id: string;
  actions: Record<string, unknown>; // Keeping this more general unless specific actions are known
  long_running_tool_ids?: string[]; // Optional based on example
  // Remove the generic index signature if possible, or keep if truly needed for unknown props
  // [key: string]: unknown; // Use unknown instead of any if needed
}

export const chatApi = {
  // Replace the mock 'text' method with the actual API call
  text: async (messages: Pick<Message, 'role' | 'content'>[]): Promise<{ role: MessageRole; content: string }> => {
    const sessionId = getSessionId();
    // Ensure session exists on backend before sending message (optional, uncomment if needed)
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

  // Keep the stream method commented out or remove it, as the API doc doesn't specify streaming.
  // If streaming is needed later, it would require a different API endpoint or approach.
  /*
  stream: async (messages: ChatRequest['messages'],
                onChunk: (chunk: { role: MessageRole; content: string }) => void,
                onFinish: () => void) => {
    // Streaming implementation would go here if the API supported it
    console.warn("Streaming not implemented for this API based on current documentation.");
    // Simulate a non-streaming response via chunks for compatibility?
    const response = await chatApi.text(messages);
    onChunk(response);
    onFinish();
  }
  */
}; 