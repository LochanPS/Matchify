# Pathfinder Backend API

Express.js REST API for tournament management.

## Quick Start

```bash
npm install
npm run dev
```

## Available Scripts

- `npm start` - Run production server
- `npm run dev` - Run with nodemon (auto-reload)

## Environment Setup

Copy `.env.example` to `.env` and fill in values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:port/database
```

## Database Setup

### Run Migrations
```bash
node scripts/runMigrations.js
```

### Test Connection
```bash
node scripts/testConnection.js
```

## Project Structure

```
backend/
├── config/          # Database & Firebase config
├── controllers/     # Route controllers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Auth & validation
├── services/        # Business logic
├── utils/           # Helper functions
├── scripts/         # Database scripts
├── migrations/      # SQL migrations
└── server.js        # Entry point
```

## API Endpoints

### Status
- `GET /` - API info
- `GET /health` - Health check

### Authentication (Coming Day 4)
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login

### Tournaments (Coming Day 5)
- `GET /tournaments` - List tournaments
- `POST /tournaments` - Create tournament
- `GET /tournaments/:id` - Tournament details

More endpoints coming in Week 2...

## Testing

Use Thunder Client, Postman, or curl:

```bash
curl http://localhost:5000/health
```

## Dependencies

### Core
- express - Web framework
- pg - PostgreSQL client
- cors - CORS middleware
- dotenv - Environment variables

### Dev
- nodemon - Auto-reload during development

## Database

PostgreSQL 14+ required. See `/docs/DATABASE.md` for schema details.

## License

MIT
