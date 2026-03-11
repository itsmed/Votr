# Architecture

## Overview

PollUs is a full-stack application with a React frontend and an Express/Node.js backend. The backend proxies requests to the Congress.gov API and stores user voting data in PostgreSQL.

## Frontend

- **React** with TypeScript and React Router for client-side routing
- **Tailwind CSS** for styling
- **Vite** as the build tool and dev server
- Communicates with the backend via REST API calls

## Backend

- **Express** with TypeScript
- Proxies Congress.gov API requests (keeps the API key server-side)
- Stores user votes and session data in **PostgreSQL**
- Exposes a REST API consumed by the frontend

## Data Flow

```
User browser
  └─> React frontend (Vite, port 3000)
        └─> Express backend (port 3001)
              ├─> Congress.gov API
              └─> PostgreSQL database
```

## Error Handling

- Centralized error middleware in Express
- Circuit breaker pattern for Congress.gov API calls
- React error boundaries in the frontend
- See [CLAUDE.md](../CLAUDE.md) for full error handling strategy
