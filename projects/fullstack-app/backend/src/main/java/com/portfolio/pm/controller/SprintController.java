package com.portfolio.pm.controller;

import com.portfolio.pm.model.dto.SprintRequest;
import com.portfolio.pm.model.dto.SprintResponse;
import com.portfolio.pm.service.SprintService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
@Tag(name = "Sprints", description = "Sprint management endpoints")
public class SprintController {

    private final SprintService sprintService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<SprintResponse>> getSprintsByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintResponse> getSprintById(@PathVariable UUID id) {
        return ResponseEntity.ok(sprintService.getSprintById(id));
    }

    @PostMapping
    public ResponseEntity<SprintResponse> createSprint(@Valid @RequestBody SprintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sprintService.createSprint(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SprintResponse> updateSprint(@PathVariable UUID id,
                                                        @Valid @RequestBody SprintRequest request) {
        return ResponseEntity.ok(sprintService.updateSprint(id, request));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<SprintResponse> activateSprint(@PathVariable UUID id) {
        return ResponseEntity.ok(sprintService.activateSprint(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<SprintResponse> completeSprint(@PathVariable UUID id) {
        return ResponseEntity.ok(sprintService.completeSprint(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable UUID id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }
}
