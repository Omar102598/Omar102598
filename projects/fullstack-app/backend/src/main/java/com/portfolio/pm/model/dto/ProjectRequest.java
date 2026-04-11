package com.portfolio.pm.model.dto;

import com.portfolio.pm.model.Project.ProjectStatus;
import jakarta.validation.constraints.NotBlank;

public record ProjectRequest(
        @NotBlank String name,
        String description,
        String owner,
        ProjectStatus status
) {}
