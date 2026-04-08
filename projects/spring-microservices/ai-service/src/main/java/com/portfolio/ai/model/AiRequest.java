package com.portfolio.ai.model;

import jakarta.validation.constraints.NotBlank;

public record AiRequest(
        @NotBlank(message = "Prompt must not be blank")
        String prompt,
        String context,
        Integer maxTokens,
        Double temperature
) {
    public AiRequest {
        if (maxTokens == null) maxTokens = 1000;
        if (temperature == null) temperature = 0.7;
    }
}
