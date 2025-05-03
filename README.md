# AI Chat Assistant

A modern chat application that allows users to communicate with an AI assistant. The application supports both regular and streaming responses, file uploads, and voice messages.

## Features

- 💬 Text chat with AI assistant
- 🔄 Real-time streaming responses
- 🎤 Voice message recording and playback
- 📎 File attachments support
- 🌓 Dark and light theme toggle
- 💾 Persistent chat history with local storage
- 📱 Responsive design for all devices

## Technologies Used

- Next.js 15.3
- React 19
- Tailwind CSS 4
- shadcn/ui components
- Zustand for state management
- TypeScript
- React Markdown

## Getting Started

### Prerequisites

- Node.js 18.17 or later

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-chat-assistant.git
cd ai-chat-assistant
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── chat/            # Chat UI components and logic
│   ├── index.css        # Global styles (potentially replaces globals.css)
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Shared React components
│   ├── chat/            # Chat-specific UI components
│   ├── theme-provider/  # Theme context provider
│   ├── theme-toggle/    # Theme toggle component directory
│   └── ui/              # UI components (likely shadcn)
├── common/              # Common utilities, types, or constants
├── services/            # API service interactions (e.g., API calls, audio, file handling)
└── store/               # State management (e.g., Zustand store)
```

# API Google ADK Integration Guide

## Introduction

This documentation outlines how to connect a frontend application with the Multi-Tool Agent API service. The service is built using the Google Agent Development Kit (ADK) and leverages multiple capabilities through specialized sub-agents and Model Context Protocol (MCP) toolsets.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication](#authentication)
4. [Connecting to the API](#connecting-to-the-api)
5. [Available Endpoints](#available-endpoints)
6. [Handling Responses](#handling-responses)
7. [Integration Examples](#integration-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [References](#references)

## Overview

The Multi-Tool Agent is an AI service built using Google's Agent Development Kit (ADK) that combines multiple specialized sub-agents to handle various tasks:

- **Main Agent**: Acts as an orchestrator that delegates requests to appropriate sub-agents
- **File System Agent**: Handles file operations and filesystem interactions
- **Search Agent**: Processes search-related queries using Brave Search
- **Slack Agent**: Manages Slack-related operations and interactions

The service uses the Model Context Protocol (MCP) to facilitate communication between the agents and external tools.

## Architecture

```
┌─────────────────┐       ┌─────────────────────┐
│                 │       │                     │
│  Frontend       │◄─────►│  Multi-Tool Agent   │
│  Application    │       │  API Service        │
│                 │       │                     │
└─────────────────┘       └─────────┬───────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │  Google ADK         │
                          │  (Agent Dev Kit)    │
                          └─────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
          ┌─────────────────┐ ┌────────────┐ ┌────────────────┐
          │ FileSystem      │ │ Slack      │ │ Search         │
          │ Sub-Agent       │ │ Sub-Agent  │ │ Sub-Agent      │
          └─────────────────┘ └────────────┘ └────────────────┘
                    │               │               │
                    ▼               ▼               ▼
          ┌─────────────────┐ ┌────────────┐ ┌────────────────┐
          │ MCP FileSystem  │ │ MCP Slack  │ │ MCP Search     │
          │ Tools           │ │ Tools      │ │ Tools          │
          └─────────────────┘ └────────────┘ └────────────────┘
```

The Multi-Tool Agent uses Gemini 2.0 Flash model to process user requests and delegate to the appropriate sub-agent. Each sub-agent is specialized for its specific domain and uses MCP tools to perform operations.


## Connecting to the API

The API can be accessed at the following endpoint:

```
http://localhost:8000
```


## Available Endpoints

### `/run`

Main endpoint for interacting with the agent system.

**Method:** POST

**Request:**

```json
{
  "app_name": "multi_tool_agent",
  "user_id": "123",
  "session_id": "431",
  "new_message": {
    "role": "user",
    "parts": [
        {
            "text": "can you list allowed directories for me please?"
        }
    ]
  }
}
```

**Response:**

```json
[
    {
        "content": {
            "parts": [
                {
                    "text": "I am sorry, I cannot directly list allowed directories. I can transfer you to the file_system_agent who might be able to help you with that.\n"
                },
                {
                    "functionCall": {
                        "id": "adk-ee466baa-0a44-4ba1-bb70-1dbf5eb30a34",
                        "args": {
                            "agent_name": "file_system_agent"
                        },
                        "name": "transfer_to_agent"
                    }
                }
            ],
            "role": "model"
        },
        "invocation_id": "e-18d0ff68-268a-4127-b399-e9c7b4d122f4",
        "author": "main_agent",
        "actions": {
            "state_delta": {},
            "artifact_delta": {},
            "requested_auth_configs": {}
        },
        "long_running_tool_ids": [],
        "id": "4UIB6uCy",
        "timestamp": 1746252295.386281
    },
    {
        "content": {
            "parts": [
                {
                    "functionResponse": {
                        "id": "adk-ee466baa-0a44-4ba1-bb70-1dbf5eb30a34",
                        "name": "transfer_to_agent",
                        "response": {}
                    }
                }
            ],
            "role": "user"
        },
        "invocation_id": "e-18d0ff68-268a-4127-b399-e9c7b4d122f4",
        "author": "main_agent",
        "actions": {
            "state_delta": {},
            "artifact_delta": {},
            "transfer_to_agent": "file_system_agent",
            "requested_auth_configs": {}
        },
        "id": "wi2EjEy2",
        "timestamp": 1746252297.265972
    },
    {
        "content": {
            "parts": [
                {
                    "functionCall": {
                        "id": "adk-1f3635b2-cadc-4be3-a05e-9ce2f9f526f5",
                        "args": {},
                        "name": "list_allowed_directories"
                    }
                }
            ],
            "role": "model"
        },
        "invocation_id": "e-18d0ff68-268a-4127-b399-e9c7b4d122f4",
        "author": "file_system_agent",
        "actions": {
            "state_delta": {},
            "artifact_delta": {},
            "requested_auth_configs": {}
        },
        "long_running_tool_ids": [],
        "id": "XsJ1t2Db",
        "timestamp": 1746252297.287655
    },
    {
        "content": {
            "parts": [
                {
                    "functionResponse": {
                        "id": "adk-1f3635b2-cadc-4be3-a05e-9ce2f9f526f5",
                        "name": "list_allowed_directories",
                        "response": {
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "Allowed directories:\n/mnt/c/users/mathe/desktop"
                                    }
                                ],
                                "isError": false
                            }
                        }
                    }
                }
            ],
            "role": "user"
        },
        "invocation_id": "e-18d0ff68-268a-4127-b399-e9c7b4d122f4",
        "author": "file_system_agent",
        "actions": {
            "state_delta": {},
            "artifact_delta": {},
            "requested_auth_configs": {}
        },
        "id": "CtjQtuLV",
        "timestamp": 1746252300.369107
    },
    {
        "content": {
            "parts": [
                {
                    "text": "OK. The allowed directories are: /mnt/c/users/mathe/desktop"
                }
            ],
            "role": "model"
        },
        "invocation_id": "e-18d0ff68-268a-4127-b399-e9c7b4d122f4",
        "author": "file_system_agent",
        "actions": {
            "state_delta": {},
            "artifact_delta": {},
            "requested_auth_configs": {}
        },
        "id": "2bVPBrcZ",
        "timestamp": 1746252300.371299
    }
]
```

### `/apps/multi_tool_agent/users/{userId}/sessions/{sessionId}`

Endpoint for create new session Id. The new id used is the value setted in params {sessionId}, must be unique uuids. The user id is managed by application.

**Method:** POST

**Response:**

```json
{
    "id": "431",
    "app_name": "multi_tool_agent",
    "user_id": "123",
    "state": {},
    "events": [],
    "last_update_time": 1746252278.1094322
}
```


## Best Practices

### 1. Session Management

- Create and maintain a session ID for each user to ensure conversation continuity
- Store session IDs securely and associate them with user identity
- Consider expiring sessions after a period of inactivity

### 2. Error Handling

Implement comprehensive error handling:

```javascript
try {
  const response = await sendQuery(message, sessionId);
  // Process response
} catch (error) {
  if (error.status === 401) {
    // Authentication error
    refreshToken();
  } else if (error.status === 429) {
    // Rate limit error
    showRetryMessage(error.retry_after);
  } else {
    // General error
    logError(error);
    showFallbackMessage();
  }
}
```

### 3. User Experience

- Implement typing indicators during streaming responses
- Show tool usage indicators when the agent is using tools
- Provide fallback options when the agent cannot process a request
- Implement a feedback mechanism for responses


## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify API key or token is valid and not expired
   - Check permissions associated with the key/token

2. **Rate Limiting**
   - Implement exponential backoff for retries
   - Monitor usage to stay within limits

3. **Connection Issues**
   - Implement connection timeouts and retries
   - Check network connectivity and firewall settings

4. **Streaming Issues**
   - Ensure proper handling of disconnections
   - Implement reconnection logic with backoff

5. **Tool-Specific Errors**
   - Check tool permissions and configuration
   - Verify syntax for tool-specific commands

### Debugging Tips

- Enable verbose logging for development environments
- Use network monitoring tools to inspect requests and responses
- Implement client-side error reporting
- Contact support with specific request IDs when reporting issues

