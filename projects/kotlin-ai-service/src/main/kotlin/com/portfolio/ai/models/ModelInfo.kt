package com.portfolio.ai.models

import kotlinx.serialization.Serializable

@Serializable
data class ModelInfo(
    val id: String,
    val name: String,
    val version: String,
    val type: String,
    val description: String,
    val accuracy: Double,
    val isActive: Boolean,
    val createdAt: String
)
