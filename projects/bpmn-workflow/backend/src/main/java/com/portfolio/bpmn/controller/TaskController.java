package com.portfolio.bpmn.controller;

import com.portfolio.bpmn.model.WorkflowTask;
import com.portfolio.bpmn.model.dto.TaskRequest;
import com.portfolio.bpmn.model.dto.TaskResponse;
import com.portfolio.bpmn.service.TaskService;
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
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "APIs for managing workflow tasks")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Create a new task", description = "Creates a new workflow task")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Task created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body")
    })
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieves a workflow task by its unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task found"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping
    @Operation(summary = "Get all tasks", description = "Retrieves a paginated list of all workflow tasks")
    @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully")
    public ResponseEntity<Page<TaskResponse>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort));
        return ResponseEntity.ok(taskService.getAllTasks(pageable));
    }

    @GetMapping("/process/{processInstanceId}")
    @Operation(summary = "Get tasks by process", description = "Retrieves all tasks belonging to a process instance")
    @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully")
    public ResponseEntity<Page<TaskResponse>> getTasksByProcess(
            @PathVariable UUID processInstanceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(taskService.getTasksByProcessInstance(processInstanceId, pageable));
    }

    @GetMapping("/assignee/{assignee}")
    @Operation(summary = "Get tasks by assignee", description = "Retrieves all tasks assigned to a specific user")
    @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully")
    public ResponseEntity<Page<TaskResponse>> getTasksByAssignee(
            @PathVariable String assignee,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(taskService.getTasksByAssignee(assignee, pageable));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get tasks by status", description = "Retrieves all tasks with a specific status")
    @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully")
    public ResponseEntity<Page<TaskResponse>> getTasksByStatus(
            @PathVariable WorkflowTask.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(taskService.getTasksByStatus(status, pageable));
    }

    @PostMapping("/{id}/assign")
    @Operation(summary = "Assign a task", description = "Assigns a task to a specific user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task assigned successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    public ResponseEntity<TaskResponse> assignTask(
            @PathVariable UUID id,
            @RequestParam String assignee) {
        return ResponseEntity.ok(taskService.assignTask(id, assignee));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start a task", description = "Marks a task as in progress")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task started successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    public ResponseEntity<TaskResponse> startTask(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.startTask(id));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete a task", description = "Marks a task as completed")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task completed successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    public ResponseEntity<TaskResponse> completeTask(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.completeTask(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a task", description = "Cancels a workflow task")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task cancelled successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    public ResponseEntity<TaskResponse> cancelTask(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.cancelTask(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task", description = "Deletes a workflow task by its unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Task deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
