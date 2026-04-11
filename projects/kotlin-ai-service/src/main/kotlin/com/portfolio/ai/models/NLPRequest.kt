package com.portfolio.ai.models

import kotlinx.serialization.Serializable

@Serializable
data class NLPRequest(
    val text: String,
    /** Supported tasks: summarize, classify, extract_entities, sentiment */
    val task: String
) {
    init {
        require(task in VALID_TASKS) {
            "Invalid task '$task'. Must be one of: ${VALID_TASKS.joinToString()}"
        }
        require(text.isNotBlank()) { "Text must not be blank" }
    }

    companion object {
        val VALID_TASKS = setOf("summarize", "classify", "extract_entities", "sentiment")
    }
}
