"use client";

import { v4 as uuidv4 } from 'uuid';
import { Attachment } from './store';

export const fileService = {
  createAttachmentFromFile(file: File): Attachment {
    const url = URL.createObjectURL(file);
    
    return {
      id: uuidv4(),
      type: 'file',
      name: file.name,
      url,
      size: file.size
    };
  },
  
  createAttachmentFromAudioBlob(blob: Blob, name: string = 'Voice message'): Attachment {
    const url = URL.createObjectURL(blob);
    const fileName = `${name}.mp3`;
    
    return {
      id: uuidv4(),
      type: 'audio',
      name: fileName,
      url,
      size: blob.size
    };
  },
  
  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  },
  
  getFileTypeIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return '🔊';
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'webm':
        return '🎬';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'zip':
      case 'rar':
      case '7z':
        return '🗜️';
      default:
        return '📎';
    }
  },
  
  cleanupAttachments(attachments: Attachment[]) {
    for (const attachment of attachments) {
      URL.revokeObjectURL(attachment.url);
    }
  }
}; 