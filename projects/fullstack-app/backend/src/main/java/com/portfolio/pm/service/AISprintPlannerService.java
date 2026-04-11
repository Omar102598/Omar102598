package com.portfolio.pm.service;

import com.portfolio.pm.model.dto.AISprintPlanRequest;
import com.portfolio.pm.model.dto.AISprintPlanResponse;

public interface AISprintPlannerService {

    AISprintPlanResponse planSprint(AISprintPlanRequest request);

    int estimateTaskStoryPoints(String taskTitle, String taskDescription);
}
