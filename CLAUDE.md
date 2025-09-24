# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a React-based AI-native notes application designed as a personal desktop web app for MacBook users. Currently in planning phase with comprehensive specification ready for implementation.

## Tech Stack
- **Framework**: Next.js with static export (`output: 'export'`)
- **UI**: Shadcn/UI with Tailwind CSS
- **State**: React Hooks + custom useLocalStorage
- **Storage**: Browser localStorage only
- **AI**: OpenRouter.ai API (deepseek/deepseek-chat-v3.1)

## Key Commands
```bash
# Initialize project
npx create-next-app@latest ai-notes-app

# Install dependencies
npm install
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react react-markdown uuid
npm install -D tailwindcss postcss autoprefixer

# Development
npm run dev

# Build for production
npm run build

# Static export
npm run export
```

## Architecture
- **AppLayout.jsx**: Three-column layout container
- **Sidebar.jsx**: Left icon navigation
- **NoteList.jsx**: Middle column with note titles
- **Editor.jsx**: Main editing area with markdown support
- **PolishModal.jsx**: AI content comparison modal
- **Settings.jsx**: API key configuration

## Data Structure
```typescript
interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

## Storage Pattern
- Uses custom `useLocalStorage` hook for persistence
- Auto-save with debounced updates
- No backend - pure frontend with external AI API calls

## Development Notes
- Project currently has only specification file: `记事本产品需求文档.md`
- Greenfield implementation required
- Static deployment ready (CDN/hosting compatible)
- No authentication - personal use app

## Communication Preferences
- 请始终用中文和我沟通