package com.portfolio.pm.controller;

import com.portfolio.pm.model.dto.AISprintPlanRequest;
import com.portfolio.pm.model.dto.AISprintPlanResponse;
import com.portfolio.pm.service.AISprintPlannerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI-powered sprint planning and estimation endpoints")
public class AIController {

    private final AISprintPlannerService aiSprintPlannerService;

    @PostMapping("/plan-sprint")
    public ResponseEntity<AISprintPlanResponse> planSprint(@Valid @RequestBody AISprintPlanRequest request) {
        return ResponseEntity.ok(aiSprintPlannerService.planSprint(request));
    }

    @PostMapping("/estimate-task")
    public ResponseEntity<Integer> estimateTask(@RequestParam String title,
                                                 @RequestParam(required = false) String description) {
        return ResponseEntity.ok(aiSprintPlannerService.estimateTaskStoryPoints(title, description));
    }
}
