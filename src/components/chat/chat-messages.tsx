"use client";

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/store';
import { MessageComponent } from './message';

interface ChatMessagesProps {
  chatId: string;
}

export function ChatMessages({ chatId }: ChatMessagesProps) {
  const { getChat } = useStore();
  const chat = getChat(chatId);
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

  return (
    <ScrollArea ref={scrollAreaRef} className="pl-5 pr-5 w-full h-full">
      {chat ? chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
            <h3 className="text-xl font-medium mb-2">Welcome to your conversation with EVA</h3>
            <p>Send a message to start chatting</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-4">
            {chat.messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
            <h3 className="text-xl font-medium mb-2">There is no chat history</h3>
          </div>
        )
      }
    </ScrollArea>
  );
} 