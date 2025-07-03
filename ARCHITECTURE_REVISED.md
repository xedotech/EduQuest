# EduQuest Revised Architecture - Free Tier Services

## Overview
EduQuest is a full-stack progressive web application that transforms educational content into gamified learning experiences. This revised architecture uses entirely free-tier services to ensure zero cost while maintaining scalability and performance.

## Technology Stack (Revised)

### Frontend
- **Framework**: React 19 with Vite
- **UI Library**: Radix UI + Tailwind CSS (Liquid Glass theme)
- **State Management**: React Context + Hooks + Supabase Client
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **PWA**: Workbox for offline functionality

### Backend & Database
- **Database**: Supabase (PostgreSQL) - 500MB free
- **Authentication**: Supabase Auth - 50,000 MAU free
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage - 1GB free
- **API**: Cloudflare Workers - 100,000 requests/day free
- **Edge Functions**: Supabase Edge Functions (Deno runtime)

### External Services (Free Tier)
- **OCR**: Google Cloud Vision API (1,000 units/month) or Tesseract.js (client-side)
- **Hosting**: Vercel or Netlify (unlimited static sites)
- **CDN**: Cloudflare (free tier)
- **Web3**: Web3Auth (free tier) + Polygon ID
- **IPFS**: Pinata or Fleek (free pinning service)

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │    │ Cloudflare      │    │   Supabase      │
│   (Frontend)    │◄──►│ Workers (API)   │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service       │    │   OCR Service   │    │   Web3 Layer    │
│   Worker        │    │   (Vision API)  │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Schema (Supabase PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 100,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{"theme": "light", "language": "en", "notifications": true}',
  web3_data JSONB DEFAULT '{"wallet_address": null, "polygon_id": null, "ipfs_profile": null}'
);
```

### Quests Table
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('pdf', 'image', 'text', 'url')),
  source_content JSONB NOT NULL,
  levels JSONB NOT NULL,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stats JSONB DEFAULT '{"completions": 0, "average_score": 0, "likes": 0}'
);
```

### User Progress Table
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  level_progress JSONB DEFAULT '{}',
  UNIQUE(user_id, quest_id)
);
```

### Leaderboards Table
```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('global', 'department', 'quest')),
  scope TEXT,
  entries JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Marketplace Table
```sql
CREATE TABLE marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('avatar', 'quest_unlock', 'boost')),
  item_data JSONB NOT NULL,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Community Events Table
```sql
CREATE TABLE community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('challenge', 'competition', 'study_group')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  participants UUID[],
  rewards JSONB DEFAULT '{"xp": 0, "coins": 0, "badges": []}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints (Cloudflare Workers)

### Authentication (Supabase Auth)
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/user` - Get current user
- `PUT /auth/user` - Update user profile

### Content Processing
- `POST /content/upload` - Upload and process content
- `POST /content/ocr` - OCR processing
- `POST /content/generate-quest` - Generate quest from content

### Quests
- `GET /quests` - Get user's quests
- `GET /quests/public` - Get public quests
- `GET /quests/:id` - Get specific quest
- `POST /quests` - Create new quest
- `PUT /quests/:id` - Update quest
- `DELETE /quests/:id` - Delete quest

### Progress & Gamification
- `GET /progress/:questId` - Get quest progress
- `POST /progress/:questId/level/:levelId` - Submit level completion
- `GET /progress/stats` - Get user statistics
- `POST /rewards/claim` - Claim XP and coins

### Social Features
- `GET /leaderboards/:type` - Get leaderboards
- `GET /community/events` - Get community events
- `POST /community/events/:id/join` - Join event
- `GET /marketplace` - Get marketplace items
- `POST /marketplace/purchase` - Purchase item

## Free Tier Limits & Optimization

### Supabase Free Tier
- **Database**: 500MB PostgreSQL
- **Auth**: 50,000 monthly active users
- **Storage**: 1GB file storage
- **Bandwidth**: 2GB egress per month
- **Real-time**: Unlimited connections

### Cloudflare Workers Free Tier
- **Requests**: 100,000 per day
- **CPU Time**: 10ms per request
- **Memory**: 128MB per request

### Optimization Strategies
1. **Database Optimization**:
   - Use JSONB for flexible data storage
   - Implement proper indexing
   - Use Supabase's built-in caching

2. **API Optimization**:
   - Implement request batching
   - Use edge caching with Cloudflare
   - Minimize API calls with efficient queries

3. **Frontend Optimization**:
   - Code splitting and lazy loading
   - Image optimization and compression
   - Service worker for offline functionality

## Security Considerations

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: Row Level Security (RLS) policies
3. **Data Validation**: Zod schemas + PostgreSQL constraints
4. **Rate Limiting**: Cloudflare Workers rate limiting
5. **Content Security**: File type validation and scanning

## Deployment Strategy

1. **Frontend**: Deploy to Vercel or Netlify
2. **Backend**: Cloudflare Workers for API endpoints
3. **Database**: Supabase hosted PostgreSQL
4. **Monitoring**: Supabase built-in analytics
5. **CDN**: Cloudflare for global distribution

## Migration from Current Setup

1. **Replace Firebase with Supabase**:
   - Migrate authentication system
   - Update database schema
   - Implement real-time subscriptions

2. **Replace Flask with Cloudflare Workers**:
   - Convert Flask routes to Workers
   - Implement serverless functions
   - Update CORS configuration

3. **Update Frontend**:
   - Replace Firebase SDK with Supabase client
   - Update API endpoints
   - Test all functionality

This revised architecture ensures 100% free operation while providing enterprise-grade features and scalability for EduQuest.

