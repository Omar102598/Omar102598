package com.portfolio.pm.model.dto;

import com.portfolio.pm.model.Task;
import com.portfolio.pm.model.Task.TaskPriority;
import com.portfolio.pm.model.Task.TaskStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        UUID projectId,
        TaskStatus status,
        TaskPriority priority,
        String assignee,
        int storyPoints,
        int sprint,
        LocalDateTime dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TaskResponse from(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getProjectId(),
                t.getStatus(),
                t.getPriority(),
                t.getAssignee(),
                t.getStoryPoints(),
                t.getSprint(),
                t.getDueDate(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
