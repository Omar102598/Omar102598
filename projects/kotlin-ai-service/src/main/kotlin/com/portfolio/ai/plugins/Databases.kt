package com.portfolio.ai.plugins

import com.portfolio.ai.database.DatabaseFactory
import io.ktor.server.application.*
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

fun Application.configureDatabases() {
    val dbUrl = environment.config.propertyOrNull("database.url")?.getString()
        ?: System.getenv("DATABASE_URL")
        ?: "jdbc:postgresql://localhost:5432/ai_service"
    val dbUser = environment.config.propertyOrNull("database.user")?.getString()
        ?: System.getenv("DATABASE_USER")
        ?: "postgres"
    val dbPassword = environment.config.propertyOrNull("database.password")?.getString()
        ?: System.getenv("DATABASE_PASSWORD")
        ?: "PLACEHOLDER_POSTGRES_PASSWORD"

    try {
        DatabaseFactory.init(dbUrl, dbUser, dbPassword)
        logger.info { "Database connection established" }
    } catch (e: Exception) {
        logger.warn { "Database connection failed: ${e.message}. Running without persistence." }
    }
}
