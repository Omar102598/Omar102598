# BPMN Workflow Automation Engine

Enterprise workflow engine using Camunda BPM with Spring Boot, featuring AI-assisted decision nodes.

## Tech Stack
- **Backend:** Java 17, Spring Boot 3.2, Camunda BPM 7.20
- **Frontend:** Angular 17 (process management UI)
- **Database:** PostgreSQL 15
- **AI:** OpenAI API for decision automation
- **Infrastructure:** Docker, Kubernetes

## Features
- BPMN process instance lifecycle management (start, suspend, resume, complete, terminate)
- Workflow task board with Kanban-style status tracking (Pending → In Progress → Completed)
- AI-powered decision evaluation via OpenAI GPT with full audit logging
- REST API with Swagger UI (`/swagger-ui.html`)
- Camunda BPM Cockpit & Tasklist web apps (`/camunda`)
- Health checks and metrics via Spring Actuator + Micrometer
- Docker Compose for local development
- Kubernetes manifests for production deployment

## Project Structure

```
bpmn-workflow/
├── backend/                         # Spring Boot application
│   ├── src/main/java/com/portfolio/bpmn/
│   │   ├── BpmnWorkflowApplication.java
│   │   ├── model/                   # JPA entities
│   │   │   ├── ProcessInstance.java
│   │   │   ├── WorkflowTask.java
│   │   │   ├── DecisionLog.java
│   │   │   └── dto/                 # Request/Response records
│   │   ├── repository/              # Spring Data JPA
│   │   ├── service/                 # Business logic
│   │   ├── controller/              # REST controllers
│   │   ├── exception/               # Global error handling
│   │   └── config/                  # OpenAPI, RestTemplate
│   ├── src/main/resources/
│   │   └── application.yml
│   └── Dockerfile
├── frontend/                        # Angular 17 application
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── process-list/        # Process instance table
│   │   │   └── task-board/          # Kanban task board
│   │   ├── services/                # HTTP client services
│   │   └── models/                  # TypeScript interfaces
│   └── angular.json
├── kubernetes/
│   ├── deployment.yml
│   └── service.yml
└── docker-compose.yml
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/processes` | Start a new process instance |
| GET | `/api/processes` | List all process instances (paginated) |
| GET | `/api/processes/{id}` | Get process by ID |
| POST | `/api/processes/{id}/suspend` | Suspend a process |
| POST | `/api/processes/{id}/resume` | Resume a suspended process |
| POST | `/api/processes/{id}/complete` | Mark process as completed |
| POST | `/api/processes/{id}/terminate` | Terminate a process |
| POST | `/api/tasks` | Create a workflow task |
| GET | `/api/tasks` | List all tasks (paginated) |
| POST | `/api/tasks/{id}/assign` | Assign task to a user |
| POST | `/api/tasks/{id}/start` | Start a task |
| POST | `/api/tasks/{id}/complete` | Complete a task |
| POST | `/api/decisions/evaluate` | Evaluate decision via AI |
| GET | `/api/decisions/task/{taskId}` | Get decisions for a task |

## Quick Start

### Local Development (Docker Compose)

```bash
cd bpmn-workflow
docker compose up -d
```

Services:
- Backend API: http://localhost:8085
- Swagger UI: http://localhost:8085/swagger-ui.html
- Camunda Cockpit: http://localhost:8085/camunda
- Frontend: http://localhost:4200

### Frontend Only

```bash
cd frontend
npm install
npm start
```

### Backend Only

```bash
cd backend
mvn spring-boot:run
```

### Kubernetes Deployment

```bash
kubectl apply -f kubernetes/service.yml
kubectl apply -f kubernetes/deployment.yml
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_NAME` | `bpmndb` | Database name |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | — | Database password |
| `CAMUNDA_ADMIN_USER` | `admin` | Camunda admin username |
| `CAMUNDA_ADMIN_PASSWORD` | — | Camunda admin password |
| `OPENAI_API_KEY` | _(optional)_ | OpenAI API key for AI decisions |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |

## Status
✅ **Implementation complete**
