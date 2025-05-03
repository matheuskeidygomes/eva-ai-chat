"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStore, Attachment } from '@/lib/store';
import { AudioRecorder } from '@/lib/audio-service';
import { fileService } from '@/lib/file-service';
import { chatApi } from '@/lib/api';
import { SpeechRecognizer, speechRecognitionService } from '@/lib/speech-recognition-service';

interface ChatInputProps {
  chatId: string;
}

export function ChatInput({ chatId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeechSupported = typeof window !== 'undefined' && speechRecognitionService.isSupported();
  
  const { addMessage } = useStore();
  
  useEffect(() => {
    // Initialize audio recorder and speech recognizer
    recorderRef.current = new AudioRecorder();
    
    if (isSpeechSupported) {
      try {
        recognizerRef.current = new SpeechRecognizer();
        
        // Set up speech recognition callbacks
        recognizerRef.current.onTranscript((text) => {
          setInterimTranscript(text);
        });
        
        recognizerRef.current.onFinal((text) => {
          setMessage((prev) => prev + (prev ? ' ' : '') + text);
          setInterimTranscript('');
          setIsListening(false);
        });
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    }
    
    return () => {
      // Clean up attachments when component unmounts
      fileService.cleanupAttachments(attachments);
      stopRecording();
      stopListening();
    };
  }, []);
  
  useEffect(() => {
    // Auto-resize textarea as content changes
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message, interimTranscript]);
  
  const handleSendMessage = async () => {
    if ((message.trim() === '' && attachments.length === 0) || isLoading) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const userMessage = {
        role: 'user' as const,
        content: message,
        attachments: attachments.length > 0 ? [...attachments] : undefined,
      };
      addMessage(chatId, userMessage);
      
      setMessage('');
      setAttachments([]);
      
      // Get all messages from this chat to send as context
      const chat = useStore.getState().getChat(chatId);
      if (!chat) return;
      
      const messageHistory = chat.messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const aiMessage = await chatApi.text([...messageHistory, userMessage]);
      addMessage(chatId, aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newAttachments = Array.from(files).map(file => 
      fileService.createAttachmentFromFile(file)
    );
    
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };
  
  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };
  
  const startRecording = async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }
      
      await recorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  const stopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;
    
    try {
      const audioBlob = await recorderRef.current.stop();
      const attachment = fileService.createAttachmentFromAudioBlob(
        audioBlob, 
        `Voice message ${new Date().toISOString().substring(11, 19)}`
      );
      
      setAttachments(prev => [...prev, attachment]);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    } finally {
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const startListening = () => {
    if (!recognizerRef.current || isListening) return;
    
    try {
      recognizerRef.current.start();
      setIsListening(true);
      setInterimTranscript('');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };
  
  const stopListening = () => {
    if (!recognizerRef.current || !isListening) return;
    
    try {
      recognizerRef.current.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    } finally {
      setIsListening(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-2 bg-background">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-2">
          {attachments.map(attachment => (
            <div key={attachment.id} className="relative group">
              <div className="border rounded p-2 bg-muted/30 flex items-center gap-2">
                <span>{fileService.getFileTypeIcon(attachment.name)}</span>
                <span className="text-sm max-w-32 truncate">{attachment.name}</span>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="h-5 w-5 absolute -top-2 -right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Input area */}
      <div className="flex items-end gap-1">
        <div className="relative flex-1">
          <Textarea
            ref={textAreaRef}
            placeholder="Type a message..."
            rows={1}
            disabled={isLoading}
            value={isListening ? message + ' ' + interimTranscript : message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none py-3 pr-12 h-5 max-h-36 overflow-y-auto"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full h-8 w-8"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {isSpeechSupported ? (
            <Button
              type="button"
              variant={isListening ? "destructive" : "secondary"}
              size="icon"
              disabled={isLoading || isRecording}
              onClick={toggleListening}
              className="rounded-full h-10 w-10 flex-shrink-0"
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <div className="relative">
                  <MicOff className="h-5 w-5" />
                  <span className="absolute -top-8 -left-3 bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded text-xs animate-pulse">
                    Listening...
                  </span>
                </div>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant={isRecording ? "destructive" : "secondary"}
              size="icon"
              disabled={isLoading}
              onClick={toggleRecording}
              className="rounded-full h-10 w-10 flex-shrink-0"
            >
              {isRecording ? (
                <div className="relative">
                  <MicOff className="h-5 w-5" />
                  <span className="absolute -top-8 -left-3 text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Button
            type="button"
            disabled={isLoading || (message.trim() === '' && attachments.length === 0)}
            onClick={handleSendMessage}
            className="rounded-full h-10 w-10 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 