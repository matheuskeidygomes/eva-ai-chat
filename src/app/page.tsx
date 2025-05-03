"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";

export default function Home() {
  const router = useRouter();
  const { chats, createChat } = useStore();
  
  useEffect(() => {
    // If there are existing chats, redirect to the most recent one
    if (chats.length > 0) {
      const sortedChats = [...chats].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      router.push(`/chat/${sortedChats[0].id}`);
    } else {
      // Otherwise create a new chat
      const newChatId = createChat();
      router.push(`/chat/${newChatId}`);
    }
  }, []);
  
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">AI Chat Assistant</h1>
        <p className="text-muted-foreground">Redirecting to chat...</p>
      </div>
    </main>
  );
}
