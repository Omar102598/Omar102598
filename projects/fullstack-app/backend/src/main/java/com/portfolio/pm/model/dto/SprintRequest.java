package com.portfolio.pm.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record SprintRequest(
        @NotNull UUID projectId,
        @NotBlank String name,
        String goal,
        LocalDateTime startDate,
        LocalDateTime endDate,
        int velocity
) {}
