# Kotlin AI Microservice

Intelligent microservice built with Kotlin and Ktor, featuring ML model serving, NLP capabilities, and OpenAI integration.

## Tech Stack
- **Language:** Kotlin 1.9.22
- **Framework:** Ktor 2.3.7 (Netty engine)
- **AI/ML:** OpenAI API (`gpt-4o-mini` default), math-based predictive models
- **Serialization:** kotlinx.serialization
- **Database:** PostgreSQL + Exposed ORM + HikariCP
- **Metrics:** Micrometer + Prometheus
- **Logging:** Logback + kotlin-logging
- **Infrastructure:** Docker, Kubernetes

## Features
- REST API for AI text generation via OpenAI
- Natural language processing: summarize, classify, extract entities, sentiment analysis
- Predictive analytics with multiple model types and A/B testing
- In-memory model registry with version tracking (50/50 traffic split)
- Request logging to PostgreSQL via Exposed ORM
- Health checks and Prometheus metrics via Micrometer
- Graceful fallback mock responses when `OPENAI_API_KEY` is not set

## Quick Start

### Docker Compose
```bash
# Optional: set your OpenAI key
export OPENAI_API_KEY=sk-...

docker-compose up --build
```
Service will be available at `http://localhost:8090`.

### Local Development
```bash
# Requires JDK 17+ and a running PostgreSQL instance
export DATABASE_URL=jdbc:postgresql://localhost:5432/ai_service
export DATABASE_USER=postgres
export DATABASE_PASSWORD=PLACEHOLDER_POSTGRES_PASSWORD

./gradlew run
```

### Build fat JAR
```bash
./gradlew buildFatJar
java -jar build/libs/kotlin-ai-service.jar
```

## API Reference

### AI Text Generation

#### `POST /api/ai/generate`
Generate text using the OpenAI API (falls back to mock when key is absent).

**Request:**
```json
{
  "prompt": "Explain Kotlin coroutines in one paragraph",
  "maxTokens": 500,
  "temperature": 0.7,
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "id": "chatcmpl-abc123",
  "text": "Kotlin coroutines are...",
  "model": "gpt-4o-mini",
  "usage": {
    "promptTokens": 12,
    "completionTokens": 87,
    "totalTokens": 99
  },
  "processingTimeMs": 1234
}
```

#### `GET /api/ai/health`
Returns OpenAI configuration status.

---

### NLP Processing

#### `POST /api/nlp/process`
Run an NLP task on a piece of text.

**Supported tasks:** `summarize` · `classify` · `extract_entities` · `sentiment`

**Request:**
```json
{
  "text": "The Federal Reserve raised interest rates today...",
  "task": "sentiment"
}
```

**Response:**
```json
{
  "task": "sentiment",
  "result": "NEGATIVE",
  "confidence": 0.92,
  "processingTimeMs": 643
}
```

---

### Predictive Analytics

#### `POST /api/predict/predict`
Run ML model inference on a feature vector.

**Request:**
```json
{
  "features": {
    "age": 35.0,
    "income": 72000.0,
    "score": 0.85
  },
  "modelId": "default"
}
```

**Response:**
```json
{
  "prediction": 0.7312,
  "confidence": 0.8962,
  "modelId": "default",
  "modelVersion": "2.0.0",
  "processingTimeMs": 5
}
```

#### `GET /api/predict/models`
List all registered models.

#### `GET /api/predict/models/{id}`
Get details for a specific model.

**Available model IDs:** `default` · `sentiment-classifier` · `anomaly-detector`

---

### Health & Metrics

| Endpoint | Description |
|---|---|
| `GET /health` | Overall service health |
| `GET /metrics/summary` | JVM memory, threads, CPU summary |
| `GET /metrics/prometheus` | Prometheus scrape endpoint |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8090` | HTTP server port |
| `OPENAI_API_KEY` | *(none)* | OpenAI API key — mock responses used if absent |
| `OPENAI_API_BASE_URL` | `https://api.openai.com` | OpenAI API base URL |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/ai_service` | JDBC connection string |
| `DATABASE_USER` | `postgres` | Database user |
| `DATABASE_PASSWORD` | *(placeholder)* | Database password |

## Project Structure

```
src/main/kotlin/com/portfolio/ai/
├── Application.kt               # Entry point
├── plugins/
│   ├── Routing.kt               # Route wiring + CORS + error handling
│   ├── Serialization.kt         # kotlinx.serialization JSON config
│   ├── Monitoring.kt            # Logging, Micrometer, CallId
│   └── Databases.kt             # HikariCP + Exposed init
├── models/                      # @Serializable data classes
├── services/
│   ├── OpenAIService.kt         # Ktor CIO HTTP client → OpenAI
│   ├── NLPService.kt            # Task-specific NLP via OpenAI
│   ├── PredictiveService.kt     # Math-based ML inference
│   └── ModelRegistryService.kt  # In-memory registry + A/B testing
├── routes/
│   ├── AIRoutes.kt
│   ├── NLPRoutes.kt
│   ├── PredictiveRoutes.kt
│   └── HealthRoutes.kt
└── database/
    ├── DatabaseFactory.kt
    ├── AIRequestLog.kt          # Exposed table definition
    └── AIRequestLogRepository.kt
```

## Kubernetes Deployment

```bash
kubectl apply -f kubernetes/deployment.yml
kubectl apply -f kubernetes/service.yml
```

Update the `ai-service-secrets` Secret with real credentials before deploying to production.
