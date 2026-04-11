package com.portfolio.ai.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import mu.KotlinLogging
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

private val logger = KotlinLogging.logger {}

object DatabaseFactory {

    private var dataSource: HikariDataSource? = null

    fun init(jdbcUrl: String, user: String, password: String) {
        val config = HikariConfig().apply {
            this.jdbcUrl = jdbcUrl
            this.username = user
            this.password = password
            driverClassName = "org.postgresql.Driver"
            maximumPoolSize = 10
            minimumIdle = 2
            idleTimeout = 600_000
            connectionTimeout = 30_000
            validationTimeout = 5_000
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            poolName = "KotlinAIServicePool"
        }

        dataSource = HikariDataSource(config)
        Database.connect(dataSource!!)

        transaction {
            SchemaUtils.create(AIRequestLogTable)
        }

        logger.info { "Database initialised at $jdbcUrl" }
    }

    fun close() {
        dataSource?.close()
        logger.info { "Database connection pool closed" }
    }
}
