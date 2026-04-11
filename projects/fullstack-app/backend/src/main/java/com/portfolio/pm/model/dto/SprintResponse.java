package com.portfolio.pm.model.dto;

import com.portfolio.pm.model.Sprint;
import com.portfolio.pm.model.Sprint.SprintStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record SprintResponse(
        UUID id,
        UUID projectId,
        String name,
        String goal,
        LocalDateTime startDate,
        LocalDateTime endDate,
        SprintStatus status,
        int velocity,
        LocalDateTime createdAt
) {
    public static SprintResponse from(Sprint s) {
        return new SprintResponse(
                s.getId(),
                s.getProjectId(),
                s.getName(),
                s.getGoal(),
                s.getStartDate(),
                s.getEndDate(),
                s.getStatus(),
                s.getVelocity(),
                s.getCreatedAt()
        );
    }
}
