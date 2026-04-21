# DevInsight – AI Code Reviewer Workspace

A full-stack MERN application that provides an AI-powered code review workspace with JWT authentication, project/snippet management, and intelligent code analysis using Groq AI or rule-based fallback.

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, Monaco Editor, React Router, Axios
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas (free tier)
- **Auth**: JWT-based (bcrypt password hashing)
- **AI**: Groq API (LLaMA 3.3 70B) with rule-based fallback

## Project Structure

```
DevInsight/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   └── services/        # API service (Axios)
│   ├── index.html
│   └── vite.config.js
├── server/                  # Express backend
│   ├── config/              # DB connection
│   ├── controllers/         # Route handlers
│   ├── middleware/           # JWT auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/            # AI analysis service
│   └── server.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier) — [Create one here](https://www.mongodb.com/cloud/atlas)

### 1. Clone and Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env` from the template:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/devinsight?retryWrites=true&w=majority
JWT_SECRET=pick_a_strong_secret_key
GROQ_API_KEY=                          # Optional — leave empty for rule-based analysis
```

### 3. Run the Application

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Optional: AI Setup (Groq)

1. Get a free API key at [console.groq.com](https://console.groq.com)
2. Add it to `server/.env` as `GROQ_API_KEY`
3. Restart the backend

Without a Groq key, code analysis uses the built-in rule-based engine (line counts, complexity checks, readability analysis).

## API Endpoints

| Method | Endpoint                | Description              | Auth |
|--------|-------------------------|--------------------------|------|
| POST   | `/api/auth/register`    | Register new user        | No   |
| POST   | `/api/auth/login`       | Login                    | No   |
| POST   | `/api/projects`         | Create project           | Yes  |
| GET    | `/api/projects`         | Get user's projects      | Yes  |
| PUT    | `/api/projects/:id`     | Update project           | Yes  |
| DELETE | `/api/projects/:id`     | Delete project           | Yes  |
| POST   | `/api/snippets`         | Create snippet           | Yes  |
| GET    | `/api/snippets/:projId` | Get project snippets     | Yes  |
| PUT    | `/api/snippets/:id`     | Update snippet           | Yes  |
| DELETE | `/api/snippets/:id`     | Delete snippet           | Yes  |
| POST   | `/api/review/:snippetId`| Generate code review     | Yes  |
| GET    | `/api/review/:snippetId`| Get snippet reviews      | Yes  |
| DELETE | `/api/review/:id`       | Delete review            | Yes  |

## Deployment

- **Frontend**: Deploy `client/` to [Vercel](https://vercel.com) — set `VITE_API_URL` env var to your backend URL
- **Backend**: Deploy `server/` to [Render](https://render.com) — set all `.env` variables in the dashboard
- **Database**: Use MongoDB Atlas (already cloud-hosted)
