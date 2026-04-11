package com.portfolio.bpmn.controller;

import com.portfolio.bpmn.model.dto.AIDecisionRequest;
import com.portfolio.bpmn.model.dto.AIDecisionResponse;
import com.portfolio.bpmn.service.AIDecisionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decisions")
@RequiredArgsConstructor
@Tag(name = "AI Decision Engine", description = "APIs for AI-powered workflow decision evaluation")
public class AIDecisionController {

    private final AIDecisionService aiDecisionService;

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate a decision", description = "Submits input data to the AI decision engine and returns a decision with reasoning")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Decision evaluated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body")
    })
    public ResponseEntity<AIDecisionResponse> evaluateDecision(@Valid @RequestBody AIDecisionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aiDecisionService.evaluateDecision(request));
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Get decisions by task", description = "Retrieves all AI decisions made for a specific task")
    @ApiResponse(responseCode = "200", description = "Decisions retrieved successfully")
    public ResponseEntity<List<AIDecisionResponse>> getDecisionsByTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(aiDecisionService.getDecisionsByTaskId(taskId));
    }

    @GetMapping
    @Operation(summary = "Get all decisions", description = "Retrieves a paginated list of all AI decision logs")
    @ApiResponse(responseCode = "200", description = "Decisions retrieved successfully")
    public ResponseEntity<Page<AIDecisionResponse>> getAllDecisions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(aiDecisionService.getAllDecisions(pageable));
    }
}
