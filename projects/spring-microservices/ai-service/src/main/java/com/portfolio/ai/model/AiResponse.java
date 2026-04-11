package com.portfolio.ai.model;

public record AiResponse(
        String content,
        String model,
        Integer tokensUsed,
        Long processingTimeMs
) {
}
