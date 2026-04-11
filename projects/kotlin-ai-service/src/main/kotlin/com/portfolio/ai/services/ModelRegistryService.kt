package com.portfolio.ai.services

import com.portfolio.ai.models.ModelInfo
import mu.KotlinLogging
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

private val logger = KotlinLogging.logger {}

/**
 * In-memory registry of available ML models with version tracking
 * and A/B testing support (50/50 traffic split between active versions).
 */
class ModelRegistryService {

    private val models = ConcurrentHashMap<String, MutableList<ModelInfo>>()
    private val requestCounter = AtomicLong(0)

    init {
        seedDefaultModels()
    }

    fun getAllModels(): List<ModelInfo> =
        models.values.flatten().sortedBy { it.id }

    fun getModelById(id: String): ModelInfo? =
        models.values.flatten().firstOrNull { it.id == id }

    fun getActiveModelsForId(modelId: String): List<ModelInfo> =
        models[modelId]?.filter { it.isActive } ?: emptyList()

    /**
     * Selects a model version for inference using 50/50 A/B traffic split.
     * Falls back to the first active model if only one version exists.
     */
    fun selectModelVersion(modelId: String): ModelInfo? {
        val activeVersions = getActiveModelsForId(modelId)
        if (activeVersions.isEmpty()) return null
        if (activeVersions.size == 1) return activeVersions.first()

        // 50/50 A/B split using round-robin counter
        val index = (requestCounter.incrementAndGet() % activeVersions.size).toInt()
        return activeVersions[index]
    }

    fun registerModel(model: ModelInfo) {
        models.getOrPut(model.id) { mutableListOf() }.add(model)
        logger.info { "Registered model: ${model.id} v${model.version}" }
    }

    private fun seedDefaultModels() {
        val now = Instant.now().toString()

        listOf(
            ModelInfo(
                id = "default",
                name = "General Purpose Predictor v1",
                version = "1.0.0",
                type = "regression",
                description = "Baseline weighted-sum regression model for general predictions",
                accuracy = 0.82,
                isActive = true,
                createdAt = now
            ),
            ModelInfo(
                id = "default",
                name = "General Purpose Predictor v2",
                version = "2.0.0",
                type = "regression",
                description = "Improved regression model with normalisation (A/B test candidate)",
                accuracy = 0.87,
                isActive = true,
                createdAt = now
            ),
            ModelInfo(
                id = "sentiment-classifier",
                name = "Sentiment Classifier",
                version = "1.2.0",
                type = "classification",
                description = "Binary sentiment classification model",
                accuracy = 0.91,
                isActive = true,
                createdAt = now
            ),
            ModelInfo(
                id = "anomaly-detector",
                name = "Anomaly Detector",
                version = "1.0.1",
                type = "anomaly_detection",
                description = "Detects anomalous patterns in feature vectors",
                accuracy = 0.89,
                isActive = true,
                createdAt = now
            )
        ).forEach { registerModel(it) }
    }
}
