# Pathfinder Enhanced 🏸

A mobile-first badminton tournament management platform for India.

## Project Overview

Pathfinder Enhanced simplifies badminton tournament organization and player participation. Built with a focus on mobile UX and automation.

### Key Features (MVP)
- 🎯 Player tournament discovery and registration
- 📋 Organizer tournament creation and management
- 🏆 Automated bracket generation (Knockout & League)
- 📊 Player statistics tracking
- 📱 Mobile-first responsive design

## Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS + Shadcn UI
- React Router
- Axios for API calls

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- Firebase Authentication
- RESTful API architecture

**Hosting:**
- Frontend: Vercel
- Backend: Railway
- Database: Railway/Supabase

## Project Structure

```
pathfinder-enhanced/
├── backend/              # Express.js API server
│   ├── config/          # Database & Firebase config
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── scripts/         # Database scripts
│   ├── migrations/      # SQL migrations
│   └── server.js        # Entry point
├── frontend/            # React application (Coming Day 1)
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── utils/       # Helper functions
│   └── public/
└── docs/                # Documentation
    ├── API.md           # API documentation
    ├── DATABASE.md      # Database schema
    ├── SETUP_GUIDE.md   # Setup instructions
    └── DAILY_LOG.md     # Development log
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Railway/Supabase account)
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/pathfinder-enhanced.git
cd pathfinder-enhanced
```

**2. Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

**3. Set up Database**

Choose one option:
- **Railway**: See `/docs/SETUP_GUIDE.md` (Recommended)
- **Supabase**: See `/docs/SETUP_GUIDE.md`
- **Local PostgreSQL**: See `/docs/SETUP_GUIDE.md`

Run migrations:
```bash
node scripts/runMigrations.js
```

Test connection:
```bash
node scripts/testConnection.js
```

**4. Start Backend**
```bash
npm run dev
# Runs on http://localhost:5000
```

**5. Set up Frontend** (Coming Day 1)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:port/database
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

See `.env.example` for full configuration.

## Development Status

### Week 1: Foundation Phase
- [x] Day 0: Pre-development setup ✅
- [x] Day 1: Project initialization (Backend) ✅
- [x] Day 2: Database setup & schema ✅
- [ ] Day 3: Firebase authentication
- [ ] Day 4: User API endpoints
- [ ] Day 5: Tournament API endpoints (Part 1)

### Upcoming Weeks
- [ ] Week 2: Core backend APIs
- [ ] Week 3: Frontend foundation
- [ ] Week 4: Organizer features & testing
- [ ] Week 5-8: Feature polish & deployment
- [ ] Week 9-12: Beta testing & iteration
- [ ] Week 13+: Public launch

## API Documentation

See `/docs/API.md` for complete API documentation.

### Available Endpoints

**Status:**
- `GET /` - API information
- `GET /health` - Health check

**Coming Soon:**
- Authentication endpoints (Day 4)
- Tournament endpoints (Day 5)
- User endpoints (Day 4)
- Match endpoints (Week 2)

## Database Schema

See `/docs/DATABASE.md` for complete schema documentation.

### Tables
- **users** - Player and organizer accounts
- **tournaments** - Tournament information
- **participants** - Tournament registrations
- **matches** - Match records

## Scripts

### Backend
```bash
npm start          # Run production server
npm run dev        # Run with auto-reload
node scripts/runMigrations.js    # Run database migrations
node scripts/testConnection.js   # Test database connection
```

## Testing

Use Thunder Client, Postman, or curl:

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000
```

## Contributing

This is an MVP project. Contributions welcome after public launch!

## Team

- Full-stack Developer: Pathfinder Team
- Product Owner: Pathfinder Team

## License

MIT License - see LICENSE file for details.

## Contact

- Email: support@pathfinder-enhanced.com
- GitHub: @pathfinder-enhanced

---

**Built with ❤️ for the badminton community**

## Quick Links

- [Setup Guide](/docs/SETUP_GUIDE.md)
- [Database Documentation](/docs/DATABASE.md)
- [API Documentation](/docs/API.md)
- [Daily Development Log](/docs/DAILY_LOG.md)

## Current Progress

✅ Backend infrastructure complete
✅ Database schema implemented
✅ Migration scripts ready
✅ Connection pooling configured
⏳ Frontend initialization pending
⏳ Firebase authentication pending
⏳ API endpoints pending

**Last Updated:** December 17, 2024
**Current Phase:** Week 1 - Day 2 Complete
