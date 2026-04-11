package com.portfolio.ai.routes

import com.portfolio.ai.models.AIRequest
import com.portfolio.ai.services.OpenAIService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

fun Route.aiRoutes(openAIService: OpenAIService) {
    route("/api/ai") {
        post("/generate") {
            val request = call.receive<AIRequest>()
            require(request.prompt.isNotBlank()) { "Prompt must not be blank" }
            require(request.maxTokens in 1..4096) { "maxTokens must be between 1 and 4096" }
            require(request.temperature in 0.0..2.0) { "temperature must be between 0.0 and 2.0" }

            logger.info { "AI generate request: model=${request.model}, promptLength=${request.prompt.length}" }
            val response = openAIService.generateText(request)
            call.respond(HttpStatusCode.OK, response)
        }

        get("/health") {
            call.respond(
                HttpStatusCode.OK,
                mapOf(
                    "service" to "ai",
                    "status" to "UP",
                    "openaiConfigured" to (!System.getenv("OPENAI_API_KEY").isNullOrBlank())
                )
            )
        }
    }
}
