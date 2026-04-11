package com.portfolio.bpmn.service;

import com.portfolio.bpmn.exception.ResourceNotFoundException;
import com.portfolio.bpmn.model.WorkflowTask;
import com.portfolio.bpmn.model.dto.TaskRequest;
import com.portfolio.bpmn.model.dto.TaskResponse;
import com.portfolio.bpmn.repository.WorkflowTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    private final WorkflowTaskRepository workflowTaskRepository;

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        log.info("Creating task: {} for process: {}", request.taskName(), request.processInstanceId());

        WorkflowTask task = WorkflowTask.builder()
                .processInstanceId(request.processInstanceId())
                .taskName(request.taskName())
                .assignee(request.assignee())
                .candidateGroup(request.candidateGroup())
                .priority(request.priority() > 0 ? request.priority() : 50)
                .dueDate(request.dueDate())
                .status(WorkflowTask.Status.PENDING)
                .build();

        WorkflowTask saved = workflowTaskRepository.save(task);
        log.info("Task created with id: {}", saved.getId());
        return TaskResponse.from(saved);
    }

    @Override
    public TaskResponse getTaskById(UUID id) {
        log.debug("Fetching task by id: {}", id);
        return TaskResponse.from(findOrThrow(id));
    }

    @Override
    public Page<TaskResponse> getAllTasks(Pageable pageable) {
        log.debug("Fetching all tasks, page: {}", pageable.getPageNumber());
        return workflowTaskRepository.findAll(pageable).map(TaskResponse::from);
    }

    @Override
    public Page<TaskResponse> getTasksByProcessInstance(UUID processInstanceId, Pageable pageable) {
        log.debug("Fetching tasks for process: {}", processInstanceId);
        return workflowTaskRepository.findByProcessInstanceId(processInstanceId, pageable).map(TaskResponse::from);
    }

    @Override
    public Page<TaskResponse> getTasksByAssignee(String assignee, Pageable pageable) {
        log.debug("Fetching tasks for assignee: {}", assignee);
        return workflowTaskRepository.findByAssignee(assignee, pageable).map(TaskResponse::from);
    }

    @Override
    public Page<TaskResponse> getTasksByStatus(WorkflowTask.Status status, Pageable pageable) {
        log.debug("Fetching tasks by status: {}", status);
        return workflowTaskRepository.findByStatus(status, pageable).map(TaskResponse::from);
    }

    @Override
    @Transactional
    public TaskResponse assignTask(UUID id, String assignee) {
        log.info("Assigning task {} to {}", id, assignee);
        WorkflowTask task = findOrThrow(id);
        task.setAssignee(assignee);
        return TaskResponse.from(workflowTaskRepository.save(task));
    }

    @Override
    @Transactional
    public TaskResponse startTask(UUID id) {
        log.info("Starting task: {}", id);
        WorkflowTask task = findOrThrow(id);
        task.setStatus(WorkflowTask.Status.IN_PROGRESS);
        return TaskResponse.from(workflowTaskRepository.save(task));
    }

    @Override
    @Transactional
    public TaskResponse completeTask(UUID id) {
        log.info("Completing task: {}", id);
        WorkflowTask task = findOrThrow(id);
        task.setStatus(WorkflowTask.Status.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        return TaskResponse.from(workflowTaskRepository.save(task));
    }

    @Override
    @Transactional
    public TaskResponse cancelTask(UUID id) {
        log.info("Cancelling task: {}", id);
        WorkflowTask task = findOrThrow(id);
        task.setStatus(WorkflowTask.Status.CANCELLED);
        return TaskResponse.from(workflowTaskRepository.save(task));
    }

    @Override
    @Transactional
    public void deleteTask(UUID id) {
        log.info("Deleting task: {}", id);
        if (!workflowTaskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        workflowTaskRepository.deleteById(id);
    }

    private WorkflowTask findOrThrow(UUID id) {
        return workflowTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }
}
