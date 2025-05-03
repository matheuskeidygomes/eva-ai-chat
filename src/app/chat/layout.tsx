"use client";

import React, { useState } from 'react';
import { MenuIcon, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatList } from '@/components/chat/chat-list';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <main className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] border-r bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="font-semibold">AI Chat Assistant</h1>
          <ThemeToggle />
        </div>
        <ChatList />
      </aside>
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-4 top-3 z-10 md:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h1 className="font-semibold">AI Chat Assistant</h1>
                <ThemeToggle />
              </div>
              <ChatList />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 border-b bg-background">
          <ThemeToggle />
        </header>
        
        {children}
      </div>
    </main>
  );
} 