package com.portfolio.ai.models

import kotlinx.serialization.Serializable

@Serializable
data class PredictiveRequest(
    val features: Map<String, Double>,
    val modelId: String = "default"
) {
    init {
        require(features.isNotEmpty()) { "Features map must not be empty" }
    }
}
