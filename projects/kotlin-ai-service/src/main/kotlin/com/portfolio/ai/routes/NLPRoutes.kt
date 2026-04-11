package com.portfolio.ai.routes

import com.portfolio.ai.models.NLPRequest
import com.portfolio.ai.services.NLPService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

fun Route.nlpRoutes(nlpService: NLPService) {
    route("/api/nlp") {
        post("/process") {
            val request = call.receive<NLPRequest>()
            logger.info { "NLP process request: task=${request.task}, textLength=${request.text.length}" }
            val response = nlpService.process(request)
            call.respond(HttpStatusCode.OK, response)
        }
    }
}
