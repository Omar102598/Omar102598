package com.portfolio.ai.database

import mu.KotlinLogging
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import java.util.UUID

private val logger = KotlinLogging.logger {}

data class AIRequestLogEntry(
    val id: UUID,
    val requestType: String,
    val inputData: String,
    val outputData: String,
    val processingTimeMs: Long,
    val createdAt: Instant
)

object AIRequestLogRepository {

    fun insert(
        requestType: String,
        inputData: String,
        outputData: String,
        processingTimeMs: Long
    ): UUID? = try {
        transaction {
            AIRequestLogTable.insertAndGetId {
                it[AIRequestLogTable.requestType] = requestType
                it[AIRequestLogTable.inputData] = inputData
                it[AIRequestLogTable.outputData] = outputData
                it[AIRequestLogTable.processingTimeMs] = processingTimeMs
                it[AIRequestLogTable.createdAt] = Instant.now()
            }.value
        }
    } catch (e: Exception) {
        logger.warn { "Failed to persist request log: ${e.message}" }
        null
    }

    fun findById(id: UUID): AIRequestLogEntry? = try {
        transaction {
            AIRequestLogTable.selectAll()
                .where { AIRequestLogTable.id eq id }
                .singleOrNull()
                ?.toLogEntry()
        }
    } catch (e: Exception) {
        logger.warn { "Failed to query request log: ${e.message}" }
        null
    }

    fun findAll(limit: Int = 100): List<AIRequestLogEntry> = try {
        transaction {
            AIRequestLogTable.selectAll()
                .orderBy(AIRequestLogTable.createdAt, SortOrder.DESC)
                .limit(limit)
                .map { it.toLogEntry() }
        }
    } catch (e: Exception) {
        logger.warn { "Failed to list request logs: ${e.message}" }
        emptyList()
    }

    fun countByType(requestType: String): Long = try {
        transaction {
            AIRequestLogTable.selectAll()
                .where { AIRequestLogTable.requestType eq requestType }
                .count()
        }
    } catch (e: Exception) {
        logger.warn { "Failed to count request logs: ${e.message}" }
        0L
    }

    private fun ResultRow.toLogEntry() = AIRequestLogEntry(
        id = this[AIRequestLogTable.id].value,
        requestType = this[AIRequestLogTable.requestType],
        inputData = this[AIRequestLogTable.inputData],
        outputData = this[AIRequestLogTable.outputData],
        processingTimeMs = this[AIRequestLogTable.processingTimeMs],
        createdAt = this[AIRequestLogTable.createdAt]
    )
}
