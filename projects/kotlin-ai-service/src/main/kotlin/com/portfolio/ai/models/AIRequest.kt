package com.portfolio.ai.models

import kotlinx.serialization.Serializable

@Serializable
data class AIRequest(
    val prompt: String,
    val maxTokens: Int = 500,
    val temperature: Double = 0.7,
    val model: String = "gpt-4o-mini"
)
