package com.portfolio.ai.services

import com.portfolio.ai.models.PredictiveRequest
import com.portfolio.ai.models.PredictiveResponse
import mu.KotlinLogging
import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.tanh

private val logger = KotlinLogging.logger {}

/**
 * Simulates ML model inference using math-based logic.
 * Supports multiple model IDs and version selection via [ModelRegistryService].
 *
 * Inference strategy per model type:
 *  - "default"            → sigmoid of normalised weighted sum
 *  - "sentiment-classifier" → tanh of feature mean, mapped to [0, 1]
 *  - "anomaly-detector"   → anomaly score based on variance of features
 */
class PredictiveService(private val modelRegistry: ModelRegistryService) {

    suspend fun predict(request: PredictiveRequest): PredictiveResponse {
        val startTime = System.currentTimeMillis()

        val selectedModel = modelRegistry.selectModelVersion(request.modelId)
            ?: throw IllegalArgumentException("No active model found with id '${request.modelId}'")

        logger.info {
            "Inference request: modelId=${request.modelId}, version=${selectedModel.version}, " +
                "features=${request.features.keys}"
        }

        val (prediction, confidence) = runInference(selectedModel.id, selectedModel.version, request.features)

        return PredictiveResponse(
            prediction = prediction,
            confidence = confidence,
            modelId = selectedModel.id,
            modelVersion = selectedModel.version,
            processingTimeMs = System.currentTimeMillis() - startTime
        )
    }

    private fun runInference(
        modelId: String,
        version: String,
        features: Map<String, Double>
    ): Pair<Double, Double> {
        val values = features.values.toList()
        return when (modelId) {
            "default" -> defaultRegression(values, version)
            "sentiment-classifier" -> sentimentClassification(values)
            "anomaly-detector" -> anomalyDetection(values)
            else -> defaultRegression(values, version)
        }
    }

    /** Weighted sum passed through sigmoid activation. v2 includes normalisation. */
    private fun defaultRegression(values: List<Double>, version: String): Pair<Double, Double> {
        val weights = generateWeights(values.size)
        val weightedSum = values.zip(weights).sumOf { (v, w) -> v * w }
        val normalised = if (version.startsWith("2")) weightedSum / (values.size.toDouble()) else weightedSum
        val prediction = sigmoid(normalised)
        val confidence = 0.75 + (prediction * 0.20)
        return round4(prediction) to round4(confidence.coerceIn(0.0, 1.0))
    }

    /** Tanh of feature mean mapped to [0, 1] for binary sentiment. */
    private fun sentimentClassification(values: List<Double>): Pair<Double, Double> {
        val mean = values.average()
        val raw = (tanh(mean) + 1.0) / 2.0
        val confidence = 0.80 + abs(tanh(mean)) * 0.15
        return round4(raw) to round4(confidence.coerceIn(0.0, 1.0))
    }

    /** Anomaly score based on variance relative to threshold. */
    private fun anomalyDetection(values: List<Double>): Pair<Double, Double> {
        val mean = values.average()
        val variance = values.sumOf { (it - mean) * (it - mean) } / values.size.coerceAtLeast(1)
        val anomalyScore = sigmoid(variance - 1.0)
        val confidence = 0.70 + (1.0 - anomalyScore) * 0.25
        return round4(anomalyScore) to round4(confidence.coerceIn(0.0, 1.0))
    }

    private fun sigmoid(x: Double): Double = 1.0 / (1.0 + exp(-x))

    private fun round4(value: Double): Double =
        (value * 10_000).toLong() / 10_000.0

    /** Deterministic pseudo-weights derived from feature index. */
    private fun generateWeights(size: Int): List<Double> =
        (1..size).map { i -> 1.0 / i }
}
