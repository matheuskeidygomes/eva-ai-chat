"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Image from "next/image";

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
        <Image src="/logo-black.png" alt="Logo" width={100} height={100} className="w-30 m-4 inline dark:hidden"/>
        <Image src="/logo-white.png" alt="Logo" width={100} height={100} className="w-30 m-4 hidden dark:inline"/>
        <h1 className="text-5xl font-bold font-[TESLA] dark:text-white">EVA AI</h1>
      </div>
    </main>
  );
}
