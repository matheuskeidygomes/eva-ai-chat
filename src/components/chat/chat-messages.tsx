"use client";

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';
import { MessageComponent } from './message';

interface ChatMessagesProps {
  chatId: string;
}

export function ChatMessages({ chatId }: ChatMessagesProps) {
  const { getChat } = useStore();
  const chat = useStore(state => state.chats.find(c => c.id === chatId));
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chat?.messages?.length]);
  
  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
        <p>Chat not found</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 relative overflow-hidden" ref={scrollAreaRef}>
      <ScrollArea className="h-full p-4">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <h3 className="text-xl font-medium mb-2">Welcome to your conversation with AI</h3>
            <p>Send a message to start chatting</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {chat.messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 