package com.portfolio.ai.models

import kotlinx.serialization.Serializable

@Serializable
data class PredictiveResponse(
    val prediction: Double,
    val confidence: Double,
    val modelId: String,
    val modelVersion: String,
    val processingTimeMs: Long
)
