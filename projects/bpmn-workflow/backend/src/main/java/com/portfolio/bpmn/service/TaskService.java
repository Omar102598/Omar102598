package com.portfolio.bpmn.service;

import com.portfolio.bpmn.model.WorkflowTask;
import com.portfolio.bpmn.model.dto.TaskRequest;
import com.portfolio.bpmn.model.dto.TaskResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TaskService {

    TaskResponse createTask(TaskRequest request);

    TaskResponse getTaskById(UUID id);

    Page<TaskResponse> getAllTasks(Pageable pageable);

    Page<TaskResponse> getTasksByProcessInstance(UUID processInstanceId, Pageable pageable);

    Page<TaskResponse> getTasksByAssignee(String assignee, Pageable pageable);

    Page<TaskResponse> getTasksByStatus(WorkflowTask.Status status, Pageable pageable);

    TaskResponse assignTask(UUID id, String assignee);

    TaskResponse startTask(UUID id);

    TaskResponse completeTask(UUID id);

    TaskResponse cancelTask(UUID id);

    void deleteTask(UUID id);
}
