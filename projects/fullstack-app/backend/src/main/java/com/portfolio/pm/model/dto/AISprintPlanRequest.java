package com.portfolio.pm.model.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record AISprintPlanRequest(
        @NotNull UUID projectId,
        String sprintGoal,
        int availableStoryPoints,
        List<UUID> taskIds
) {}
