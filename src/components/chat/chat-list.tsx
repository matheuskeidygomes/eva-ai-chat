"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';

export function ChatList() {
  const router = useRouter();
  const pathname = usePathname();
  const { chats, createChat, deleteChat, activeChat, setActiveChat } = useStore();
  
  const handleCreateChat = () => {
    const newChatId = createChat();
    router.push(`/chat/${newChatId}`);
  };
  
  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    router.push(`/chat/${id}`);
  };
  
  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteChat(id);
    
    if (pathname.includes(id)) {
      if (chats.length > 1) {
        const nextChat = chats.find(chat => chat.id !== id);
        if (nextChat) {
          router.push(`/chat/${nextChat.id}`);
        }
      } else {
        router.push('/');
      }
    }
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const chatDate = new Date(date);
    
    // If today, show time
    if (now.toDateString() === chatDate.toDateString()) {
      return chatDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (now.getFullYear() === chatDate.getFullYear()) {
      return chatDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return chatDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Button 
          onClick={handleCreateChat} 
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No chats yet</p>
              <p className="text-sm">Start a new conversation</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer group hover:bg-muted/50 ${
                      activeChat === chat.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{chat.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 