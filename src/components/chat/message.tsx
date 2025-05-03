"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Message, Attachment } from '@/lib/store';
import { fileService } from '@/lib/file-service';

interface MessageProps {
  message: Message;
}

export function MessageComponent({ message }: MessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        {isUser ? (
          <>
            <AvatarFallback>U</AvatarFallback>
            <AvatarImage src="/user-avatar.svg" alt="User" />
          </>
        ) : (
          <>
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/ai-avatar.svg" alt="AI Assistant" />
          </>
        )}
      </Avatar>
      
      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
        
        <Card className={`p-3 ${isUser ? 'bg-primary/10 dark:bg-primary/20' : 'bg-muted/60'}`}>
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </Card>
        
        <span className="text-xs text-muted-foreground">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
}

function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  if (attachment.type === 'audio') {
    return (
      <div className="rounded-md overflow-hidden border bg-background p-2 flex flex-col gap-1">
        <audio controls src={attachment.url} className="max-w-[240px]" />
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <span>🎤</span>
          <span className="truncate max-w-[200px]">{attachment.name}</span>
          {attachment.size && <span>({fileService.formatFileSize(attachment.size)})</span>}
        </div>
      </div>
    );
  }
  
  return (
    <a 
      href={attachment.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="rounded-md overflow-hidden border bg-background p-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
    >
      <span>{fileService.getFileTypeIcon(attachment.name)}</span>
      <div className="flex flex-col">
        <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
        {attachment.size && (
          <span className="text-xs text-muted-foreground">{fileService.formatFileSize(attachment.size)}</span>
        )}
      </div>
    </a>
  );
} 