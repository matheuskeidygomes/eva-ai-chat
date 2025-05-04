"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { useStore } from '@/store';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const { getChat, setActiveChat } = useStore();
  
  useEffect(() => {
    // Check if chat exists
    const chat = getChat(chatId);
    if (!chat) {
      toast.error('Chat not found');
      return;
    }
    // Set active chat when component mounts
    setActiveChat(chatId);

    // Clean up on unmount
    return () => {
      setActiveChat(null);
    };
  }, [chatId]);
  
  return (
    <div className="flex flex-1 flex-col min-h-0 gap-3">
      <div className="flex flex-1 justify-center items-center overflow-y-auto w-full h-full">
        <ChatMessages chatId={chatId} />
      </div>
      
      <div className="bg-background pb-4 pl-5 pr-5">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
} 