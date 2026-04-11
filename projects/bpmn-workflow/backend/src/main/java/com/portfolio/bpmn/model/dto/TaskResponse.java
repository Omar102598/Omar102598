package com.portfolio.bpmn.model.dto;

import com.portfolio.bpmn.model.WorkflowTask;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID processInstanceId,
        String taskName,
        String assignee,
        String candidateGroup,
        int priority,
        WorkflowTask.Status status,
        LocalDateTime dueDate,
        LocalDateTime completedAt,
        LocalDateTime createdAt
) {
    public static TaskResponse from(WorkflowTask task) {
        return new TaskResponse(
                task.getId(),
                task.getProcessInstanceId(),
                task.getTaskName(),
                task.getAssignee(),
                task.getCandidateGroup(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getCompletedAt(),
                task.getCreatedAt()
        );
    }
}
