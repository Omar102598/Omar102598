package com.portfolio.pm.model.dto;

import com.portfolio.pm.model.Project;
import com.portfolio.pm.model.Project.ProjectStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String name,
        String description,
        ProjectStatus status,
        String owner,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProjectResponse from(Project p) {
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getStatus(),
                p.getOwner(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
