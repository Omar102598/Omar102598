package com.portfolio.bpmn.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskRequest(
        @NotNull(message = "Process instance ID is required")
        UUID processInstanceId,

        @NotBlank(message = "Task name is required")
        String taskName,

        String assignee,

        String candidateGroup,

        int priority,

        LocalDateTime dueDate
) {}
