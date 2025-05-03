"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { useStore } from '@/lib/store';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const { getChat, setActiveChat } = useStore();
  
  useEffect(() => {
    // Set active chat when component mounts
    setActiveChat(chatId);
    
    // Check if chat exists
    const chat = getChat(chatId);
    if (!chat) {
      toast.error('Chat not found');
    }
  }, [chatId]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages chatId={chatId} />
      </div>
      
      <div className="p-4 bg-background">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
} 