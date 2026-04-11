package com.portfolio.bpmn.model.dto;

import com.portfolio.bpmn.model.DecisionLog;

import java.time.LocalDateTime;
import java.util.UUID;

public record AIDecisionResponse(
        UUID id,
        UUID taskId,
        String decisionType,
        String inputData,
        String outputDecision,
        String aiReasoning,
        double confidence,
        LocalDateTime createdAt
) {
    public static AIDecisionResponse from(DecisionLog log) {
        return new AIDecisionResponse(
                log.getId(),
                log.getTaskId(),
                log.getDecisionType(),
                log.getInputData(),
                log.getOutputDecision(),
                log.getAiReasoning(),
                log.getConfidence(),
                log.getCreatedAt()
        );
    }
}
