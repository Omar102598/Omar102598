package com.portfolio.bpmn.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AIDecisionRequest(
        @NotNull(message = "Task ID is required")
        UUID taskId,

        @NotBlank(message = "Decision type is required")
        String decisionType,

        @NotBlank(message = "Input data is required")
        String inputData
) {}
