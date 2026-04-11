package com.portfolio.ai.database

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.timestamp
import java.time.Instant

object AIRequestLogTable : UUIDTable("ai_request_log") {
    val requestType = varchar("request_type", 50)
    val inputData = text("input_data")
    val outputData = text("output_data")
    val processingTimeMs = long("processing_time_ms")
    val createdAt = timestamp("created_at").default(Instant.now())
}
