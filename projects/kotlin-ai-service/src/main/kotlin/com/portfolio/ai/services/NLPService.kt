package com.portfolio.ai.services

import com.portfolio.ai.models.AIRequest
import com.portfolio.ai.models.NLPRequest
import com.portfolio.ai.models.NLPResponse
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

class NLPService(private val openAIService: OpenAIService) {

    suspend fun process(request: NLPRequest): NLPResponse {
        val startTime = System.currentTimeMillis()
        logger.info { "Processing NLP task '${request.task}' on text of length ${request.text.length}" }

        val prompt = buildPrompt(request)
        val aiRequest = AIRequest(
            prompt = prompt,
            maxTokens = 300,
            temperature = 0.3,
            model = "gpt-4o-mini"
        )

        val aiResponse = openAIService.generateText(aiRequest)
        val processingTimeMs = System.currentTimeMillis() - startTime

        val (result, confidence) = parseResult(request.task, aiResponse.text)

        return NLPResponse(
            task = request.task,
            result = result,
            confidence = confidence,
            processingTimeMs = processingTimeMs
        )
    }

    private fun buildPrompt(request: NLPRequest): String = when (request.task) {
        "summarize" ->
            "Summarize the following text concisely in 2-3 sentences:\n\n${request.text}"
        "classify" ->
            "Classify the following text into a category (e.g., Technology, Sports, Politics, Health, " +
                "Entertainment, Business, Science, Other). Respond with only the category name:\n\n${request.text}"
        "extract_entities" ->
            "Extract named entities (people, organizations, locations, dates) from the following text. " +
                "Format as a JSON object with keys 'people', 'organizations', 'locations', 'dates' " +
                "containing arrays of strings:\n\n${request.text}"
        "sentiment" ->
            "Analyze the sentiment of the following text. Respond with exactly one word: " +
                "POSITIVE, NEGATIVE, or NEUTRAL:\n\n${request.text}"
        else -> throw IllegalArgumentException("Unsupported NLP task: ${request.task}")
    }

    private fun parseResult(task: String, rawResult: String): Pair<String, Double> {
        val trimmed = rawResult.trim()
        return when (task) {
            "sentiment" -> {
                val sentiment = when {
                    trimmed.contains("POSITIVE", ignoreCase = true) -> "POSITIVE"
                    trimmed.contains("NEGATIVE", ignoreCase = true) -> "NEGATIVE"
                    else -> "NEUTRAL"
                }
                sentiment to 0.92
            }
            "classify" -> trimmed to 0.88
            "summarize" -> trimmed to 0.95
            "extract_entities" -> trimmed to 0.90
            else -> trimmed to 0.80
        }
    }
}
