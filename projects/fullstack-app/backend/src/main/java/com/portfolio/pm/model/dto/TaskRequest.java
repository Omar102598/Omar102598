package com.portfolio.pm.model.dto;

import com.portfolio.pm.model.Task.TaskPriority;
import com.portfolio.pm.model.Task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskRequest(
        @NotBlank String title,
        String description,
        @NotNull UUID projectId,
        TaskStatus status,
        TaskPriority priority,
        String assignee,
        int storyPoints,
        int sprint,
        LocalDateTime dueDate
) {}
