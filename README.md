# Remote Work Collaboration Suite

A comprehensive collaboration platform featuring real-time document editing, video conferencing, task management, and more.

## Features

- 🎨 Real-time collaborative document editing
- 📹 Video conferencing with screen sharing
- ✅ Task management with drag-and-drop
- 🎨 Collaborative whiteboard
- 💬 Real-time chat
- 👥 User presence and activity indicators

## Tech Stack

- **Frontend**: React, TypeScript, Chakra UI, TipTap, Yjs
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB/PostgreSQL
- **Real-time**: WebSockets, WebRTC
- **Authentication**: JWT, OAuth

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and fill in your values)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=your_database_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# WebSocket
WS_URL=ws://localhost:3001

# Frontend
REACT_APP_API_URL=http://localhost:3000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run typecheck` - Check TypeScript types

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TipTap](https://tiptap.dev/) - The headless editor framework
- [Yjs](https://docs.yjs.dev/) - CRDT for real-time collaboration
- [Chakra UI](https://chakra-ui.com/) - Simple, modular and accessible component library 
