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
│   ├── chat/            # Regular chat UI
│   ├── stream-chat/     # Streaming chat UI
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── chat/            # Chat-related components
│   ├── providers/       # Context providers
│   ├── ui/              # UI components from shadcn
│   └── theme-toggle.tsx # Theme toggle component
└── lib/                 # Utilities and services
    ├── api.ts           # Mock API service
    ├── audio-service.ts # Audio recording service
    ├── file-service.ts  # File handling service
    ├── store.ts         # Zustand store
    └── utils.ts         # Utility functions
```

## API Integration

The application is designed to work with an API that has two endpoints:

- `/chat/text` - For regular text responses
- `/chat/stream` - For streaming responses

Currently, the application uses mock API services that simulate these endpoints. To connect to a real API, modify the functions in `src/lib/api.ts`.

## License

MIT
