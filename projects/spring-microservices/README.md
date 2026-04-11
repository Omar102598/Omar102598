# Spring Boot Microservices Portfolio

A production-ready microservices architecture built with **Spring Boot 3.2.1**, **Spring Cloud 2023.0.0**, and **Java 17**, demonstrating enterprise patterns including service discovery, API gateway, event-driven communication, and AI integration.

## Architecture

```
                                    ┌─────────────────┐
                                    │   Config Server  │
                                    │     :8888        │
                                    └────────┬────────┘
                                             │
┌──────────┐     ┌──────────────┐   ┌────────┴────────┐
│  Client   │────▶│  API Gateway │──▶│ Service Discovery│
│           │     │    :8080     │   │  (Eureka) :8761  │
└──────────┘     └──────┬───────┘   └────────┬────────┘
                        │                    │
          ┌─────────────┼─────────────┬──────┴──────┬───────────────┐
          │             │             │             │               │
   ┌──────┴──────┐ ┌────┴─────┐ ┌────┴──────┐ ┌───┴────┐ ┌────────┴────────┐
   │User Service │ │  Order   │ │ Inventory │ │   AI   │ │  Notification   │
   │   :8081     │ │ Service  │ │  Service  │ │Service │ │    Service      │
   │             │ │  :8082   │ │   :8083   │ │ :8084  │ │     :8085       │
   └──────┬──────┘ └────┬─────┘ └────┬──────┘ └───┬────┘ └────────┬────────┘
          │             │             │            │               │
   ┌──────┴──────┐ ┌────┴─────┐ ┌────┴──────┐ ┌───┴────┐    ┌────┴─────┐
   │ PostgreSQL  │ │  MySQL   │ │SQL Server │ │OpenAI  │    │  Kafka   │
   │   :5432     │ │  :3306   │ │  :1433    │ │  API   │    │  :9092   │
   └─────────────┘ └──────────┘ └───────────┘ └────────┘    └──────────┘
```

## Tech Stack

| Technology             | Purpose                          |
|------------------------|----------------------------------|
| Java 17                | Programming Language             |
| Spring Boot 3.2.1      | Application Framework            |
| Spring Cloud 2023.0.0  | Microservices Infrastructure     |
| Spring Cloud Gateway   | API Gateway & Routing            |
| Netflix Eureka         | Service Discovery & Registration |
| Spring Cloud Config    | Centralized Configuration        |
| Apache Kafka           | Event-Driven Messaging           |
| PostgreSQL             | User Service Database            |
| MySQL                  | Order Service Database           |
| SQL Server             | Inventory Service Database       |
| Redis                  | Caching                          |
| OpenAI GPT-4           | AI-Powered Features              |
| Micrometer + Brave     | Distributed Tracing              |
| Docker & Docker Compose| Containerization                 |
| Lombok                 | Boilerplate Reduction            |
| Caffeine               | Local Caching                    |

## Services Overview

| Service              | Port | Description                                       | Database   |
|----------------------|------|---------------------------------------------------|------------|
| Service Discovery    | 8761 | Eureka server for service registration & discovery | —          |
| Config Server        | 8888 | Centralized configuration management               | —          |
| API Gateway          | 8080 | Single entry point, routing, load balancing         | —          |
| User Service         | 8081 | User management and authentication                  | PostgreSQL |
| Order Service        | 8082 | Order processing and management                     | MySQL      |
| Inventory Service    | 8083 | Inventory tracking and stock management             | SQL Server |
| AI Service           | 8084 | AI-powered recommendations, analysis, summaries     | —          |
| Notification Service | 8085 | Email/SMS notifications via Kafka events            | —          |

## Getting Started

### Prerequisites

- **Java 17** or higher
- **Maven 3.8+**
- **Docker** and **Docker Compose**
- **Git**

### Build All Services

```bash
# Clone the repository
git clone <repository-url>
cd projects/spring-microservices

# Build each service
for service in service-discovery config-server api-gateway user-service order-service inventory-service ai-service notification-service; do
  echo "Building $service..."
  cd $service && mvn clean package -DskipTests && cd ..
done
```

### Run with Docker Compose

```bash
# Start all infrastructure and services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f <service-name>

# Stop all services
docker-compose down
```

### Run Individual Services (Development)

```bash
# Start infrastructure first
docker-compose up -d postgres mysql sqlserver kafka zookeeper redis

# Start services in order
cd service-discovery && mvn spring-boot:run &
cd config-server && mvn spring-boot:run &
cd api-gateway && mvn spring-boot:run &
cd user-service && mvn spring-boot:run &
cd order-service && mvn spring-boot:run &
cd inventory-service && mvn spring-boot:run &
cd ai-service && mvn spring-boot:run &
cd notification-service && mvn spring-boot:run &
```

## API Endpoints

All endpoints are accessible through the API Gateway at `http://localhost:8080`.

### User Service

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/users            | Get all users        |
| GET    | /api/users/{id}       | Get user by ID       |
| POST   | /api/users            | Create a new user    |
| PUT    | /api/users/{id}       | Update a user        |
| DELETE | /api/users/{id}       | Delete a user        |

### Order Service

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/orders           | Get all orders       |
| GET    | /api/orders/{id}      | Get order by ID      |
| POST   | /api/orders           | Create a new order   |
| PUT    | /api/orders/{id}      | Update an order      |
| DELETE | /api/orders/{id}      | Delete an order      |

### Inventory Service

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/inventory        | Get all inventory    |
| GET    | /api/inventory/{id}   | Get item by ID       |
| POST   | /api/inventory        | Add inventory item   |
| PUT    | /api/inventory/{id}   | Update inventory     |
| DELETE | /api/inventory/{id}   | Remove inventory     |

### AI Service

| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| POST   | /api/ai/recommend     | Get AI recommendations        |
| POST   | /api/ai/analyze       | Analyze data with AI          |
| POST   | /api/ai/summarize     | Summarize text with AI        |

### Monitoring

| Endpoint                          | Description              |
|-----------------------------------|--------------------------|
| http://localhost:8761             | Eureka Dashboard         |
| http://localhost:{port}/actuator  | Actuator endpoints       |
| http://localhost:{port}/actuator/health | Health check        |
| http://localhost:{port}/actuator/metrics | Metrics             |

## Database Configuration

| Database   | Host      | Port | Database Name | Username   | Notes                      |
|------------|-----------|------|---------------|------------|----------------------------|
| PostgreSQL | localhost | 5432 | user_db       | postgres   | User Service data store    |
| MySQL      | localhost | 3306 | order_db      | orderuser  | Order Service data store   |
| SQL Server | localhost | 1433 | inventory_db  | sa         | Inventory Service data store|
| Redis      | localhost | 6379 | —             | —          | Caching layer              |

## Configuration

### Environment Variables

| Variable                  | Description                  | Default                        |
|---------------------------|------------------------------|--------------------------------|
| `OPENAI_API_KEY`          | OpenAI API Key               | PLACEHOLDER_OPENAI_API_KEY     |
| `SPRING_DATASOURCE_URL`   | Database connection URL      | Varies per service             |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | Kafka brokers         | localhost:9092                 |
| `MAIL_HOST`               | SMTP mail host               | smtp.placeholder.com           |
| `MAIL_USERNAME`           | SMTP username                | placeholder@example.com        |
| `MAIL_PASSWORD`           | SMTP password                | placeholder                    |

### Service Discovery

All services register with Eureka at startup. The API Gateway uses Eureka to discover and route to services dynamically. Access the Eureka dashboard at [http://localhost:8761](http://localhost:8761).

## Monitoring & Observability

- **Health Checks**: All services expose `/actuator/health` endpoints
- **Metrics**: Micrometer metrics available at `/actuator/metrics`
- **Distributed Tracing**: Brave/Zipkin integration via Micrometer Tracing
- **Logging**: Structured logging with configurable levels per service

## Project Structure

```
spring-microservices/
├── service-discovery/       # Eureka Server
├── config-server/           # Spring Cloud Config Server
├── api-gateway/             # Spring Cloud Gateway
├── user-service/            # User Management (PostgreSQL)
├── order-service/           # Order Processing (MySQL + Kafka)
├── inventory-service/       # Inventory Management (SQL Server)
├── ai-service/              # AI Integration (OpenAI)
├── notification-service/    # Notifications (Kafka + Email)
├── docker-compose.yml       # Docker orchestration
└── README.md                # This file
```
