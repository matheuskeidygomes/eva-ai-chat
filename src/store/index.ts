import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  type: 'file' | 'audio';
  name: string;
  url: string;
  size?: number;
}

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  createdAt: Date;
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  createChat: () => string;
  getChat: (id: string) => Chat | undefined;
  updateChat: (id: string, chat: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'createdAt'>) => void;
  setActiveChat: (id: string | null) => void;
}

export const useStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      createChat: () => {
        const id = uuidv4();
        const newChat = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          chats: [...state.chats, newChat],
          activeChat: id,
        }));
        return id;
      },
      getChat: (id) => {
        return get().chats.find((chat) => chat.id === id);
      },
      updateChat: (id, chatUpdate) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id
              ? { ...chat, ...chatUpdate, updatedAt: new Date() }
              : chat
          ),
        }));
      },
      deleteChat: (id) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
          activeChat: state.activeChat === id ? null : state.activeChat,
        }));
      },
      addMessage: (chatId, messageData) => {
        const message = {
          id: uuidv4(),
          createdAt: new Date(),
          ...messageData,
        };
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  updatedAt: new Date(),
                  title: chat.messages.length === 0 && messageData.role === 'user' 
                    ? messageData.content.slice(0, 30) + (messageData.content.length > 30 ? '...' : '')
                    : chat.title,
                }
              : chat
          ),
        }));
      },
      setActiveChat: (id) => {
        set({ activeChat: id });
      },
    }),
    {
      name: 'chat-storage',
    }
  )
); 