# EduQuest Architecture Documentation

## Overview
EduQuest is a full-stack progressive web application that transforms educational content into gamified learning experiences. The application uses a modern tech stack optimized for performance, scalability, and user experience.

## Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **UI Library**: Radix UI + Tailwind CSS (Liquid Glass theme)
- **State Management**: React Context + Hooks
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **PWA**: Workbox for offline functionality

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite (development) → Firebase Realtime Database (production)
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **OCR**: Google Cloud Vision API
- **Real-time**: Firebase Realtime Database + WebSocket

### External Services (Free Tier)
- **Firebase**: Authentication, Realtime Database, Storage, Hosting
- **Google Cloud Vision API**: OCR processing (1,000 units/month free)
- **Web3Auth**: Non-custodial wallet creation
- **Polygon ID**: Decentralized identity
- **IPFS**: Decentralized content storage

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │    │   Flask API     │    │   Firebase      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service       │    │   Google Cloud  │    │   Web3 Layer    │
│   Worker        │    │   Vision API    │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Schema

### Users Collection
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,
  displayName: string,
  avatar: string,           // Avatar customization data
  level: number,            // User level (1-10)
  xp: number,              // Experience points
  coins: number,           // In-game currency
  department: string,      // NDU department
  createdAt: timestamp,
  lastActive: timestamp,
  preferences: {
    theme: 'light' | 'dark',
    language: string,
    notifications: boolean
  },
  web3: {
    walletAddress?: string,  // Web3Auth wallet
    polygonId?: string,      // Polygon ID DID
    ipfsProfile?: string     // IPFS hash for profile data
  }
}
```

### Quests Collection
```javascript
{
  id: string,
  title: string,
  description: string,
  creatorId: string,        // User UID who created the quest
  sourceType: 'pdf' | 'image' | 'text' | 'url',
  sourceContent: {
    originalFile?: string,   // Firebase Storage URL
    extractedText: string,   // OCR/parsed content
    ipfsHash?: string       // IPFS content hash
  },
  levels: [
    {
      id: string,
      title: string,
      content: string,
      quizzes: [
        {
          question: string,
          options: string[],
          correctAnswer: number,
          explanation: string
        }
      ],
      challenges: [
        {
          type: 'text' | 'multiple_choice',
          prompt: string,
          solution: string
        }
      ],
      xpReward: number,
      coinReward: number
    }
  ],
  category: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  tags: string[],
  isPublic: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  stats: {
    completions: number,
    averageScore: number,
    likes: number
  }
}
```

### UserProgress Collection
```javascript
{
  userId: string,
  questId: string,
  currentLevel: number,
  completed: boolean,
  score: number,
  attempts: number,
  startedAt: timestamp,
  completedAt?: timestamp,
  levelProgress: {
    [levelId]: {
      completed: boolean,
      score: number,
      attempts: number,
      timeSpent: number
    }
  }
}
```

### Leaderboards Collection
```javascript
{
  id: string,
  type: 'global' | 'department' | 'quest',
  scope?: string,           // Department name or quest ID
  entries: [
    {
      userId: string,
      displayName: string,
      avatar: string,
      score: number,
      rank: number
    }
  ],
  updatedAt: timestamp
}
```

### Marketplace Collection
```javascript
{
  id: string,
  sellerId: string,
  itemType: 'avatar' | 'quest_unlock' | 'boost',
  itemData: object,
  price: number,           // In coins
  isActive: boolean,
  createdAt: timestamp
}
```

### CommunityEvents Collection
```javascript
{
  id: string,
  title: string,
  description: string,
  type: 'challenge' | 'competition' | 'study_group',
  startDate: timestamp,
  endDate: timestamp,
  participants: string[],  // User UIDs
  rewards: {
    xp: number,
    coins: number,
    badges: string[]
  },
  isActive: boolean
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Content Processing
- `POST /api/content/upload` - Upload and process content
- `POST /api/content/ocr` - OCR processing
- `POST /api/content/generate-quest` - Generate quest from content

### Quests
- `GET /api/quests` - Get user's quests
- `GET /api/quests/public` - Get public quests
- `GET /api/quests/:id` - Get specific quest
- `POST /api/quests` - Create new quest
- `PUT /api/quests/:id` - Update quest
- `DELETE /api/quests/:id` - Delete quest

### Progress
- `GET /api/progress/:questId` - Get quest progress
- `POST /api/progress/:questId/level/:levelId` - Submit level completion
- `GET /api/progress/stats` - Get user statistics

### Social Features
- `GET /api/leaderboards/:type` - Get leaderboards
- `GET /api/community/events` - Get community events
- `POST /api/community/events/:id/join` - Join event
- `GET /api/marketplace` - Get marketplace items
- `POST /api/marketplace/purchase` - Purchase item

### Web3 Integration
- `POST /api/web3/connect-wallet` - Connect Web3Auth wallet
- `POST /api/web3/verify-identity` - Verify Polygon ID
- `POST /api/web3/store-ipfs` - Store content on IPFS

## Security Considerations

1. **Authentication**: Firebase Authentication with secure token validation
2. **Authorization**: Role-based access control for quest creation and moderation
3. **Data Validation**: Zod schemas for all API inputs
4. **Rate Limiting**: Prevent abuse of OCR and AI generation endpoints
5. **Content Moderation**: Basic filtering for inappropriate content
6. **Privacy**: Encrypt sensitive user data, minimal data collection

## Performance Optimizations

1. **Frontend**:
   - Code splitting with React.lazy()
   - Image optimization and lazy loading
   - Service worker for offline functionality
   - Memoization for expensive calculations

2. **Backend**:
   - Database indexing for frequently queried fields
   - Caching with Redis (future enhancement)
   - Async processing for OCR and quest generation
   - Connection pooling for database

3. **Low-RAM Optimization**:
   - Minimal bundle size (<2MB)
   - Efficient memory management
   - Progressive loading of content
   - Optimized images and assets

## Deployment Strategy

1. **Development**: Local development with hot reloading
2. **Staging**: Firebase Hosting with test database
3. **Production**: Firebase Hosting with production database
4. **Monitoring**: Firebase Analytics and Performance Monitoring

## Future Enhancements

1. **Blockchain Integration**: Full Web3 token economy
2. **AI Improvements**: Advanced NLP for better quest generation
3. **Mobile Apps**: React Native versions
4. **Advanced Analytics**: Learning analytics and insights
5. **Internationalization**: Multi-language support
6. **Advanced Gamification**: Guilds, tournaments, achievements

## Development Workflow

1. **Phase 1**: Core infrastructure and authentication
2. **Phase 2**: Content processing and quest generation
3. **Phase 3**: Gamification and social features
4. **Phase 4**: UI/UX polish and Web3 integration
5. **Phase 5**: Testing, optimization, and deployment

This architecture ensures scalability, maintainability, and provides a solid foundation for future enhancements while keeping costs minimal through the use of free-tier services.

