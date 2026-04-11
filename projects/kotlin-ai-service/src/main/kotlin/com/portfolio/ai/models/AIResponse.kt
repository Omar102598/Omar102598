package com.portfolio.ai.models

import kotlinx.serialization.Serializable

@Serializable
data class AIResponse(
    val id: String,
    val text: String,
    val model: String,
    val usage: TokenUsage,
    val processingTimeMs: Long
)
