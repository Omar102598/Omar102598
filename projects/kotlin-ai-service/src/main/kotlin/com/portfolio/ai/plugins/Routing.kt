package com.portfolio.ai.plugins

import com.portfolio.ai.models.ErrorResponse
import com.portfolio.ai.routes.*
import com.portfolio.ai.services.ModelRegistryService
import com.portfolio.ai.services.NLPService
import com.portfolio.ai.services.OpenAIService
import com.portfolio.ai.services.PredictiveService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.time.Instant

fun Application.configureRouting() {
    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
    }

    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(
                    error = "BAD_REQUEST",
                    message = cause.message ?: "Invalid request",
                    timestamp = Instant.now().toString()
                )
            )
        }
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(
                    error = "INTERNAL_SERVER_ERROR",
                    message = cause.message ?: "An unexpected error occurred",
                    timestamp = Instant.now().toString()
                )
            )
        }
        status(HttpStatusCode.NotFound) { call, _ ->
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse(
                    error = "NOT_FOUND",
                    message = "The requested resource was not found",
                    timestamp = Instant.now().toString()
                )
            )
        }
    }

    val openAIService = OpenAIService()
    val nlpService = NLPService(openAIService)
    val modelRegistryService = ModelRegistryService()
    val predictiveService = PredictiveService(modelRegistryService)

    routing {
        aiRoutes(openAIService)
        nlpRoutes(nlpService)
        predictiveRoutes(predictiveService, modelRegistryService)
        healthRoutes()
    }
}
