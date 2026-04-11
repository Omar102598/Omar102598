package com.portfolio.ai.routes

import com.portfolio.ai.models.ErrorResponse
import com.portfolio.ai.models.PredictiveRequest
import com.portfolio.ai.services.ModelRegistryService
import com.portfolio.ai.services.PredictiveService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import mu.KotlinLogging
import java.time.Instant

private val logger = KotlinLogging.logger {}

fun Route.predictiveRoutes(
    predictiveService: PredictiveService,
    modelRegistry: ModelRegistryService
) {
    route("/api/predict") {
        post("/predict") {
            val request = call.receive<PredictiveRequest>()
            logger.info { "Predict request: modelId=${request.modelId}, features=${request.features.keys}" }
            val response = predictiveService.predict(request)
            call.respond(HttpStatusCode.OK, response)
        }

        get("/models") {
            val models = modelRegistry.getAllModels()
            call.respond(HttpStatusCode.OK, models)
        }

        get("/models/{id}") {
            val id = call.parameters["id"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("BAD_REQUEST", "Model id is required", Instant.now().toString())
                )

            val model = modelRegistry.getModelById(id)
            if (model == null) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ErrorResponse("NOT_FOUND", "Model '$id' not found", Instant.now().toString())
                )
            } else {
                call.respond(HttpStatusCode.OK, model)
            }
        }
    }
}
