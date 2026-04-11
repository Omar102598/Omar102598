package com.portfolio.pm.model.dto;

import java.util.List;
import java.util.UUID;

public record AISprintPlanResponse(
        String sprintName,
        List<UUID> recommendedTasks,
        int estimatedVelocity,
        String rationale
) {}
