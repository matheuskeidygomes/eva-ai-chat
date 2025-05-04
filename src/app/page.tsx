"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Image from "next/image";
import { createSession } from "@/services/api";

export default function Home() {
  const router = useRouter();
  const { chats, createChat } = useStore();

  async function handleCreateChat() {
    try {
      const newChatId = createChat();
      await createSession('', newChatId);
      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  }

  function handleRedirectToLastChat() {
    const sortedChats = [...chats].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    router.push(`/chat/${sortedChats[0].id}`);
  }

  // If there are existing chats, redirect to the most recent one, otherwise create a new chat
  useEffect(() => {
    if (chats.length > 0) handleRedirectToLastChat();
    else handleCreateChat();
  }, []);
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <Image src="/logo-black.png" alt="Logo" width={100} height={100} className="w-30 m-4 block dark:hidden"/>
        <Image src="/logo-white.png" alt="Logo" width={100} height={100} className="w-30 m-4 hidden dark:block"/>
        <h1 className="text-5xl font-bold font-[TESLA] dark:text-white">EVA AI</h1>
    </main>
  );
}
