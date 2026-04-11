package com.portfolio.ai.routes

import com.portfolio.ai.plugins.appMicrometerRegistry
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.lang.management.ManagementFactory
import java.time.Instant

fun Route.healthRoutes() {
    get("/health") {
        val runtime = Runtime.getRuntime()
        call.respond(
            HttpStatusCode.OK,
            mapOf(
                "status" to "UP",
                "timestamp" to Instant.now().toString(),
                "service" to "kotlin-ai-service",
                "version" to "1.0.0",
                "uptime" to "${ManagementFactory.getRuntimeMXBean().uptime}ms"
            )
        )
    }

    get("/metrics/summary") {
        val runtime = Runtime.getRuntime()
        val totalMemoryMb = runtime.totalMemory() / (1024 * 1024)
        val freeMemoryMb = runtime.freeMemory() / (1024 * 1024)
        val usedMemoryMb = totalMemoryMb - freeMemoryMb

        call.respond(
            HttpStatusCode.OK,
            mapOf(
                "timestamp" to Instant.now().toString(),
                "memory" to mapOf(
                    "totalMb" to totalMemoryMb,
                    "usedMb" to usedMemoryMb,
                    "freeMb" to freeMemoryMb
                ),
                "threads" to Thread.activeCount(),
                "processors" to runtime.availableProcessors()
            )
        )
    }

    get("/metrics/prometheus") {
        call.respondText(
            appMicrometerRegistry.scrape(),
            ContentType.parse("text/plain; version=0.0.4")
        )
    }
}
