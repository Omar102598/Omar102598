package com.portfolio.ai.models

import kotlinx.serialization.Serializable

@Serializable
data class NLPResponse(
    val task: String,
    val result: String,
    val confidence: Double,
    val processingTimeMs: Long
)
