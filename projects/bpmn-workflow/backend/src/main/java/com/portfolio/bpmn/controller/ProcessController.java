package com.portfolio.bpmn.controller;

import com.portfolio.bpmn.model.ProcessInstance;
import com.portfolio.bpmn.model.dto.ProcessRequest;
import com.portfolio.bpmn.model.dto.ProcessResponse;
import com.portfolio.bpmn.service.ProcessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/processes")
@RequiredArgsConstructor
@Tag(name = "Process Management", description = "APIs for managing BPMN process instances")
public class ProcessController {

    private final ProcessService processService;

    @PostMapping
    @Operation(summary = "Start a new process", description = "Starts a new BPMN process instance")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Process started successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "409", description = "Process with business key already exists")
    })
    public ResponseEntity<ProcessResponse> startProcess(@Valid @RequestBody ProcessRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(processService.startProcess(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get process by ID", description = "Retrieves a process instance by its unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Process found"),
            @ApiResponse(responseCode = "404", description = "Process not found")
    })
    public ResponseEntity<ProcessResponse> getProcessById(@PathVariable UUID id) {
        return ResponseEntity.ok(processService.getProcessById(id));
    }

    @GetMapping
    @Operation(summary = "Get all processes", description = "Retrieves a paginated list of all process instances")
    @ApiResponse(responseCode = "200", description = "Processes retrieved successfully")
    public ResponseEntity<Page<ProcessResponse>> getAllProcesses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort));
        return ResponseEntity.ok(processService.getAllProcesses(pageable));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get processes by status", description = "Retrieves a paginated list of process instances filtered by status")
    @ApiResponse(responseCode = "200", description = "Processes retrieved successfully")
    public ResponseEntity<Page<ProcessResponse>> getProcessesByStatus(
            @PathVariable ProcessInstance.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(processService.getProcessesByStatus(status, pageable));
    }

    @PostMapping("/{id}/suspend")
    @Operation(summary = "Suspend a process", description = "Suspends an active process instance")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Process suspended successfully"),
            @ApiResponse(responseCode = "404", description = "Process not found")
    })
    public ResponseEntity<ProcessResponse> suspendProcess(@PathVariable UUID id) {
        return ResponseEntity.ok(processService.suspendProcess(id));
    }

    @PostMapping("/{id}/resume")
    @Operation(summary = "Resume a process", description = "Resumes a suspended process instance")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Process resumed successfully"),
            @ApiResponse(responseCode = "404", description = "Process not found")
    })
    public ResponseEntity<ProcessResponse> resumeProcess(@PathVariable UUID id) {
        return ResponseEntity.ok(processService.resumeProcess(id));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete a process", description = "Marks a process instance as completed")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Process completed successfully"),
            @ApiResponse(responseCode = "404", description = "Process not found")
    })
    public ResponseEntity<ProcessResponse> completeProcess(@PathVariable UUID id) {
        return ResponseEntity.ok(processService.completeProcess(id));
    }

    @PostMapping("/{id}/terminate")
    @Operation(summary = "Terminate a process", description = "Terminates a running process instance")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Process terminated successfully"),
            @ApiResponse(responseCode = "404", description = "Process not found")
    })
    public ResponseEntity<ProcessResponse> terminateProcess(@PathVariable UUID id) {
        return ResponseEntity.ok(processService.terminateProcess(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a process", description = "Deletes a process instance by its unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Process deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Process not found")
    })
    public ResponseEntity<Void> deleteProcess(@PathVariable UUID id) {
        processService.deleteProcess(id);
        return ResponseEntity.noContent().build();
    }
}
