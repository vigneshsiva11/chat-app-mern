# AI-Powered Real-Time Chat App

A modern, full-stack MERN chat application featuring real-time messaging, comprehensive AI capabilities powered by Google Gemini, and a beautiful glassmorphic UI. Experience intelligent conversations with built-in safety, translation, and voice-to-text features.

## Key Features

### AI-Powered Capabilities (Powered by Google Gemini 1.5 Flash)

#### 1. **Chat Summarization**

- Generate bullet-point summaries of long conversations instantly
- Extracts key decisions, action items, and important highlights
- Smart participant detection and message count tracking
- MongoDB persistence with TTL expiration for optimal storage
- Intelligent caching system (reduces API calls by 70%+)

#### 2. **Smart Reply Suggestions**

- Context-aware AI responses suggested in real-time
- Analyzes last 5 messages for accurate context understanding
- Generates 3 relevant reply options with different tones
- One-click send functionality
- Priority-based processing with circuit breaker protection

#### 3. **Message Translation**

- Translate messages between 8+ languages instantly
- Supported languages: English, Spanish, French, German, Tamil, Hindi, Chinese, Japanese
- Preserves emojis and formatting
- In-memory caching for frequently translated phrases
- Single-click translation with visual feedback

#### 4. **Voice-to-Text Transcription**

- Record audio messages directly in the chat
- Real-time transcription using Gemini AI
- Visual recording indicator with elapsed time
- Edit transcribed text before sending
- Supports WebM audio format with Opus codec
- Automatic microphone permission handling

#### 5. **Toxic Content Moderation**

- Automatic screening of all messages before delivery
- Detects: hate speech, violence, sexual content, harassment, self-harm, spam
- Multi-tier severity system (low, medium, high)
- Auto-blocks messages with high toxicity scores
- User violation tracking with MongoDB logging
- Configurable enforcement levels

#### 6. **Intelligent Caching System**

- In-memory cache for AI responses (default: 1 hour TTL)
- Reduces API costs by 70%+ through smart deduplication
- TTL-based expiration for freshness
- Cache keys based on content hashing
- Automatic cache invalidation

#### 7. **AI Circuit Breaker**

- Rate limit protection with priority-based queuing
- High-priority: User-initiated actions (summarize, translate)
- Low-priority: Background tasks (moderation, suggestions)
- Automatic suspension and recovery mechanism
- Quota monitoring and graceful degradation

### Core Messaging Features

- **Real-Time Communication**: WebSocket-powered instant messaging via Socket.io
- **Rich Media Support**:
  - Text messages with emoji support
  - Image uploads via Cloudinary CDN
  - Audio message transcription
- **Message Management**:
  - Edit sent messages
  - Delete messages (soft delete)
  - Message reactions
- **Live Indicators**:
  - Typing indicators
  - Online/offline status
  - Real-time user presence
  - Read receipts
- **User Profiles**:
  - Profile pictures
  - Custom display names
  - Bio and status updates

### UI/UX Design

- **Modern Glassmorphic Design**: Premium glass-effect UI with gradient backgrounds
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Sleek dark mode with high contrast
- **Animated Components**:
  - Smooth page transitions
  - Loading animations
  - Message slide-in effects
  - Gradient animated backgrounds
- **Intuitive Layout**:
  - Left sidebar: User list with search
  - Center: Chat container with message history
  - Right sidebar: Chat info and settings
- **Toast Notifications**: Real-time feedback for all actions

### Security & Authentication

- **JWT Authentication**: Secure token-based auth with HTTP-only cookies
- **Password Hashing**: Bcrypt encryption for user passwords
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Server-side validation for all inputs
- **Content Security**: AI-powered moderation before message delivery
- **Rate Limiting**: Built-in protection against API abuse
- **Environment Variables**: Secure configuration management

## Tech Stack

### Frontend

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite (Lightning-fast HMR)
- **Styling**: Tailwind CSS 3
- **State Management**: Context API (Auth & Chat contexts)
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Real-Time**: Socket.io Client
- **UI Components**: Custom components with glassmorphism
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.io Server
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt
- **AI Integration**: Google Generative AI SDK (@google/generative-ai)
- **File Upload**: Cloudinary (Image CDN)
- **Environment Config**: dotenv
- **Security**: Cookie Parser, CORS

### Database Models

- **User Model**: Authentication, profiles, and preferences
- **Message Model**: Chat messages with metadata
- **ChatSummary Model**: AI-generated conversation summaries with TTL
- **ModerationLog Model**: Violation tracking and audit logs

### AI Services Architecture

- **aiService.js**: Core AI logic (summarize, translate, suggest, transcribe, moderate)
- **cacheService.js**: In-memory caching with TTL
- **aiController.js**: RESTful API endpoints
- **moderationMiddleware.js**: Pre-delivery content screening

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** (Free tier available) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Google Gemini API Key** (Free tier with generous quota) - [Get API Key](https://makersuite.google.com/app/apikey)
- **Cloudinary Account** (Free tier) - [Sign up](https://cloudinary.com/)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

#### 2. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=you_mangodb_uri

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Configuration (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash-latest
MODERATION_ENABLED=true
AI_CACHE_TTL=3600
```

Start the development server:

```bash
npm run dev
```

Or for production:

```bash
npm start
```

#### 3. Client Setup

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory (if needed):

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Getting API Keys

#### Google Gemini API Key (Free)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key and paste it in your `.env` file

#### MongoDB Connection String

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

#### Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Paste into your `.env` file

## Project Structure

```
chat-app/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── SmartReplies.jsx
│   │   │   ├── SummarizeButton.jsx
│   │   │   ├── TranslateButton.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   ├── chatcontainer.jsx
│   │   │   ├── sidebar.jsx
│   │   │   └── rightsidebar.jsx
│   │   ├── context/         # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Backend Node.js application
│   ├── controllers/         # Route controllers
│   │   ├── aiController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Message.js
│   │   ├── ChatSummary.js
│   │   └── ModerationLog.js
│   ├── routes/             # API routes
│   │   ├── aiRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── services/           # Business logic
│   │   ├── aiService.js
│   │   └── cacheService.js
│   ├── middleware/         # Express middleware
│   │   ├── moderationMiddleware.js
│   │   └── auth.js
│   ├── lib/                # Utility functions
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── utils.js
│   ├── server.js           # Entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check auth status

### Messages

- `GET /api/messages/:userId` - Get messages with a user
- `POST /api/messages/send/:receiverId` - Send a message
- `PUT /api/messages/:messageId` - Edit a message
- `DELETE /api/messages/:messageId` - Delete a message

### AI Features

- `POST /api/ai/summarize` - Generate chat summary
- `POST /api/ai/suggest-replies` - Get smart reply suggestions
- `POST /api/ai/translate` - Translate a message
- `POST /api/ai/transcribe` - Transcribe audio to text
- `POST /api/ai/moderate` - Moderate message content

### Users

- `GET /api/users` - Get all users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/profile-pic` - Update profile picture

## Usage Guide

### Basic Chatting

1. **Sign Up**: Create an account with email and password
2. **Select User**: Click on a user from the sidebar to start chatting
3. **Send Messages**: Type your message and press Enter or click Send
4. **Send Images**: Click the image icon to upload and send images

### AI Features

#### Summarize Conversation

1. Open a chat with message history
2. Click the **"Summarize"** button (appears above message input)
3. View bullet-point summary with key decisions and action items

#### Smart Reply Suggestions

1. When receiving messages, AI suggestions appear automatically
2. Click any suggested reply to send it instantly
3. Suggestions are context-aware based on recent conversation

#### Translate Messages

1. Hover over any message
2. Click the **"Translate"** button
3. Translated text appears inline

#### Voice-to-Text

1. Click the **microphone icon** in the message input
2. Grant microphone permission if prompted
3. Speak your message
4. Click **Stop** when done
5. Edit transcribed text if needed
6. Send the message

## Security & AI Safety

### Content Moderation

- **Pre-delivery Screening**: All messages are analyzed before being sent
- **Multi-category Detection**: Hate speech, violence, sexual content, harassment, self-harm, spam
- **Severity Levels**: Low, medium, high risk classification
- **Automatic Actions**:
  - High severity → Message blocked
  - Medium severity → Warning logged
  - Low severity → Message allowed with monitoring
- **Violation Tracking**: All moderation events logged in MongoDB

### Rate Limiting & Protection

- **AI Circuit Breaker**: Prevents quota exhaustion
- **Priority Queuing**: User actions prioritized over background tasks
- **Retry Logic**: Smart retry with exponential backoff
- **Quota Monitoring**: Real-time quota status checking

### Data Security

- **JWT Tokens**: Secure authentication with HTTP-only cookies
- **Password Hashing**: Bcrypt with salt rounds
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured cross-origin policies

## Troubleshooting

### Common Issues

**Issue**: Gemini API returns 429 (Rate Limit)

- **Solution**: Wait 60 seconds and try again. The circuit breaker will automatically manage retries.

**Issue**: Gemini API returns "Quota 0" error

- **Solution**: Your API key region may have restrictions. Create a new project in Google AI Studio or try a different Google account.

**Issue**: Messages not sending in real-time

- **Solution**: Check that Socket.io is properly connected. Look for connection status in browser console.

**Issue**: Images not uploading

- **Solution**: Verify Cloudinary credentials in `.env` file. Check file size (max 10MB).

**Issue**: AI features not working

- **Solution**: Ensure `GEMINI_API_KEY` is set in server `.env` file and has valid quota.

## Performance Optimizations

- **Caching Strategy**: 70%+ reduction in API calls
- **Code Splitting**: Lazy loading for faster initial load
- **Image Optimization**: Cloudinary CDN with automatic format conversion
- **Database Indexing**: Optimized queries with compound indexes
- **TTL Expiration**: Automatic cleanup of old chat summaries
- **WebSocket Optimization**: Efficient event handling with Socket.io rooms

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Group chat support
- [ ] End-to-end encryption
- [ ] Message search functionality
- [ ] File sharing (PDFs, documents)
- [ ] Video/Audio calls
- [ ] Message scheduling
- [ ] Customizable themes
- [ ] Multi-language UI support
- [ ] Desktop app (Electron)
- [ ] Mobile apps (React Native)
- [ ] AI-powered sentiment analysis
- [ ] Advanced analytics dashboard

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) - For powerful AI capabilities
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For database hosting
- [Cloudinary](https://cloudinary.com/) - For image CDN
- [Socket.io](https://socket.io/) - For real-time communication
- [React](https://react.dev/) - For the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - For styling

**Star ⭐ this repository if you find it helpful!**


