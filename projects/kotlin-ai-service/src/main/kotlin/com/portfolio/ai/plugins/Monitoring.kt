package com.portfolio.ai.plugins

import io.ktor.server.application.*
import io.ktor.server.plugins.callid.*
import io.ktor.server.plugins.callloging.*
import io.ktor.server.metrics.micrometer.*
import io.ktor.server.plugins.defaultheaders.*
import io.micrometer.core.instrument.binder.jvm.ClassLoaderMetrics
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics
import io.micrometer.core.instrument.binder.system.ProcessorMetrics
import io.micrometer.prometheus.PrometheusConfig
import io.micrometer.prometheus.PrometheusMeterRegistry
import org.slf4j.event.Level

val appMicrometerRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)

fun Application.configureMonitoring() {
    install(DefaultHeaders) {
        header("X-Service", "kotlin-ai-service")
        header("X-Version", "1.0.0")
    }

    install(CallId) {
        header("X-Request-Id")
        verify { callId -> callId.isNotEmpty() }
        generate { "ai-${System.currentTimeMillis()}" }
    }

    install(CallLogging) {
        level = Level.INFO
        callIdMdc("requestId")
        format { call ->
            "${call.request.httpMethod.value} ${call.request.uri} -> ${call.response.status()}"
        }
    }

    install(MicrometerMetrics) {
        registry = appMicrometerRegistry
        meterBinders = listOf(
            ClassLoaderMetrics(),
            JvmMemoryMetrics(),
            JvmGcMetrics(),
            JvmThreadMetrics(),
            ProcessorMetrics()
        )
    }
}
