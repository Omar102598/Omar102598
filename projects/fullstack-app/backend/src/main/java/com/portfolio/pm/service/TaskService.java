package com.portfolio.pm.service;

import com.portfolio.pm.model.Task.TaskStatus;
import com.portfolio.pm.model.dto.TaskRequest;
import com.portfolio.pm.model.dto.TaskResponse;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    List<TaskResponse> getTasksByProject(UUID projectId);

    TaskResponse getTaskById(UUID id);

    TaskResponse createTask(TaskRequest request);

    TaskResponse updateTask(UUID id, TaskRequest request);

    TaskResponse updateTaskStatus(UUID id, TaskStatus status);

    void deleteTask(UUID id);
}
