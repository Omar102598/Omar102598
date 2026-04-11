package com.portfolio.ai.services

import com.portfolio.ai.models.AIRequest
import com.portfolio.ai.models.AIResponse
import com.portfolio.ai.models.TokenUsage
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import mu.KotlinLogging
import java.util.UUID

private val logger = KotlinLogging.logger {}

class OpenAIService {

    private val apiKey: String? = System.getenv("OPENAI_API_KEY")
    private val apiBaseUrl = System.getenv("OPENAI_API_BASE_URL") ?: "https://api.openai.com"

    private val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
        install(Logging) {
            level = LogLevel.INFO
            logger = Logger.DEFAULT
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 30_000
            connectTimeoutMillis = 10_000
        }
    }

    suspend fun generateText(request: AIRequest): AIResponse {
        val startTime = System.currentTimeMillis()

        if (apiKey.isNullOrBlank()) {
            logger.warn { "OPENAI_API_KEY not set — returning mock response" }
            return mockResponse(request, startTime)
        }

        return try {
            val openAiRequest = OpenAIChatRequest(
                model = request.model,
                messages = listOf(OpenAIMessage(role = "user", content = request.prompt)),
                maxTokens = request.maxTokens,
                temperature = request.temperature
            )

            val response: OpenAIChatResponse = httpClient.post("$apiBaseUrl/v1/chat/completions") {
                contentType(ContentType.Application.Json)
                bearerAuth(apiKey)
                setBody(openAiRequest)
            }.body()

            val text = response.choices.firstOrNull()?.message?.content ?: ""
            val processingTimeMs = System.currentTimeMillis() - startTime

            AIResponse(
                id = response.id,
                text = text,
                model = response.model,
                usage = TokenUsage(
                    promptTokens = response.usage.promptTokens,
                    completionTokens = response.usage.completionTokens,
                    totalTokens = response.usage.totalTokens
                ),
                processingTimeMs = processingTimeMs
            )
        } catch (e: Exception) {
            logger.error(e) { "OpenAI API call failed — falling back to mock response" }
            mockResponse(request, startTime)
        }
    }

    private fun mockResponse(request: AIRequest, startTime: Long): AIResponse {
        val mockText = buildMockText(request.prompt)
        val promptTokens = (request.prompt.length / 4).coerceAtLeast(1)
        val completionTokens = (mockText.length / 4).coerceAtLeast(1)
        return AIResponse(
            id = "mock-${UUID.randomUUID()}",
            text = mockText,
            model = request.model,
            usage = TokenUsage(
                promptTokens = promptTokens,
                completionTokens = completionTokens,
                totalTokens = promptTokens + completionTokens
            ),
            processingTimeMs = System.currentTimeMillis() - startTime
        )
    }

    private fun buildMockText(prompt: String): String =
        "Mock AI response for: \"${prompt.take(80)}${if (prompt.length > 80) "..." else ""}\". " +
            "Set the OPENAI_API_KEY environment variable to enable real AI responses."

    fun close() {
        httpClient.close()
    }

    // OpenAI API internal DTOs
    @Serializable
    private data class OpenAIChatRequest(
        val model: String,
        val messages: List<OpenAIMessage>,
        @SerialName("max_tokens") val maxTokens: Int,
        val temperature: Double
    )

    @Serializable
    private data class OpenAIMessage(
        val role: String,
        val content: String
    )

    @Serializable
    private data class OpenAIChatResponse(
        val id: String,
        val model: String,
        val choices: List<OpenAIChoice>,
        val usage: OpenAIUsage
    )

    @Serializable
    private data class OpenAIChoice(
        val message: OpenAIMessage,
        @SerialName("finish_reason") val finishReason: String? = null
    )

    @Serializable
    private data class OpenAIUsage(
        @SerialName("prompt_tokens") val promptTokens: Int,
        @SerialName("completion_tokens") val completionTokens: Int,
        @SerialName("total_tokens") val totalTokens: Int
    )
}
