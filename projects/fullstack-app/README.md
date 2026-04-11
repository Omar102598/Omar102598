# Full-Stack Project Management Platform

Modern project management application with Angular Kanban frontend, React analytics dashboard, and Spring Boot backend with AI-powered sprint planning.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Main Frontend** | Angular 17, TypeScript, Angular CDK (drag-drop) |
| **Analytics Frontend** | React 18, TypeScript, Recharts |
| **Backend** | Spring Boot 3.2.1, Java 17 |
| **Database** | PostgreSQL 15 |
| **Real-time** | WebSocket (STOMP over SockJS) |
| **AI** | OpenAI GPT-4o-mini |
| **API Docs** | SpringDoc OpenAPI (Swagger UI) |
| **Observability** | Spring Actuator, Micrometer Tracing |
| **Container** | Docker, Docker Compose, Kubernetes |

## Features

- **Kanban Board** — Drag-and-drop task management across 5 columns (Backlog → Done)
- **Sprint Management** — Create, activate, and complete sprints with velocity tracking
- **AI Sprint Planning** — OpenAI-powered sprint planning with automatic task selection
- **AI Story Point Estimation** — Estimate task effort using Fibonacci scale (1, 2, 3, 5, 8, 13)
- **Real-time Collaboration** — WebSocket (STOMP) broadcasts task status updates to all connected users
- **Analytics Dashboard** — React app showing velocity charts and burndown charts
- **RESTful API** — Full CRUD for Projects, Tasks, Sprints with OpenAPI documentation

## Project Structure

```
fullstack-app/
├── backend/                        # Spring Boot API
│   ├── src/main/java/com/portfolio/pm/
│   │   ├── config/                 # Security, OpenAPI, RestTemplate
│   │   ├── controller/             # REST controllers
│   │   ├── exception/              # Global error handling
│   │   ├── model/                  # JPA entities + DTOs (records)
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── service/                # Business logic + AI service
│   │   └── websocket/              # STOMP WebSocket config
│   ├── src/main/resources/
│   │   └── application.yml
│   └── Dockerfile
├── frontend-angular/               # Angular 17 Kanban app
│   └── src/app/
│       ├── components/             # ProjectList, KanbanBoard, SprintManager
│       ├── models/                 # TypeScript interfaces & enums
│       └── services/               # HTTP + WebSocket services
├── frontend-react/                 # React 18 analytics dashboard
│   └── src/
│       ├── components/             # VelocityChart, BurndownChart, AnalyticsDashboard
│       ├── services/               # Axios API client
│       └── types/                  # TypeScript interfaces
├── kubernetes/
│   ├── deployment.yml
│   └── service.yml
└── docker-compose.yml
```

## API Endpoints

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/{id}` | Get project by ID |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks/project/{projectId}` | Get tasks by project |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/status?status=` | Update task status (triggers WebSocket) |
| DELETE | `/api/tasks/{id}` | Delete task |

### Sprints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sprints/project/{projectId}` | Get sprints by project |
| GET | `/api/sprints/{id}` | Get sprint by ID |
| POST | `/api/sprints` | Create sprint |
| PUT | `/api/sprints/{id}` | Update sprint |
| POST | `/api/sprints/{id}/activate` | Activate sprint |
| POST | `/api/sprints/{id}/complete` | Complete sprint |
| DELETE | `/api/sprints/{id}` | Delete sprint |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/plan-sprint` | AI sprint planning |
| POST | `/api/ai/estimate-task?title=&description=` | Story point estimation |

## WebSocket

**Endpoint:** `ws://localhost:8090/ws` (SockJS)

Subscribe to `/topic/tasks/{projectId}` to receive real-time `TaskUpdateMessage` events whenever a task status changes.

```json
{
  "taskId": "uuid",
  "projectId": "uuid",
  "status": "IN_PROGRESS",
  "updatedBy": "system"
}
```

## Setup

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 20+
- Docker & Docker Compose

### Quick Start with Docker Compose

```bash
cd fullstack-app

# Start all services
docker-compose up -d

# With OpenAI integration
OPENAI_API_KEY=sk-... docker-compose up -d
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8090 |
| Swagger UI | http://localhost:8090/swagger-ui.html |
| Health Check | http://localhost:8090/actuator/health |
| Angular App | http://localhost:4200 |
| React Dashboard | http://localhost:3000 |

### Local Development

**Backend:**
```bash
cd backend
# Requires PostgreSQL on localhost:5432, DB: pmdb
mvn spring-boot:run
```

**Angular Frontend:**
```bash
cd frontend-angular
npm install
npm start
# Proxies /api to localhost:8090
```

**React Frontend:**
```bash
cd frontend-react
npm install
npm start
```

### Kubernetes

```bash
# Create secrets first
kubectl create secret generic pm-db-secret \
  --from-literal=username=postgres \
  --from-literal=password=<your-password>

kubectl apply -f kubernetes/
```

## AI Configuration

Set `OPENAI_API_KEY` environment variable to enable AI features. Without it, services return intelligent fallback responses:
- Sprint planning selects the first N tasks fitting within the story point budget
- Story point estimation defaults to 3 points
