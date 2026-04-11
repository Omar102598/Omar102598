package com.portfolio.pm.service;

import com.portfolio.pm.exception.ResourceNotFoundException;
import com.portfolio.pm.model.Task;
import com.portfolio.pm.model.Task.TaskPriority;
import com.portfolio.pm.model.Task.TaskStatus;
import com.portfolio.pm.model.dto.TaskRequest;
import com.portfolio.pm.model.dto.TaskResponse;
import com.portfolio.pm.repository.TaskRepository;
import com.portfolio.pm.websocket.TaskUpdateMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<TaskResponse> getTasksByProject(UUID projectId) {
        log.debug("Fetching tasks for project: {}", projectId);
        return taskRepository.findByProjectId(projectId).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Override
    public TaskResponse getTaskById(UUID id) {
        log.debug("Fetching task by id: {}", id);
        return TaskResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        log.info("Creating task: {} for project: {}", request.title(), request.projectId());
        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .projectId(request.projectId())
                .status(request.status() != null ? request.status() : TaskStatus.BACKLOG)
                .priority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM)
                .assignee(request.assignee())
                .storyPoints(request.storyPoints())
                .sprint(request.sprint())
                .dueDate(request.dueDate())
                .build();
        Task saved = taskRepository.save(task);
        log.info("Task created with id: {}", saved.getId());
        return TaskResponse.from(saved);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UUID id, TaskRequest request) {
        log.info("Updating task: {}", id);
        Task task = findOrThrow(id);
        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        task.setAssignee(request.assignee());
        task.setStoryPoints(request.storyPoints());
        task.setSprint(request.sprint());
        task.setDueDate(request.dueDate());
        return TaskResponse.from(taskRepository.save(task));
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(UUID id, TaskStatus status) {
        log.info("Updating task {} status to {}", id, status);
        Task task = findOrThrow(id);
        task.setStatus(status);
        Task saved = taskRepository.save(task);

        TaskUpdateMessage message = new TaskUpdateMessage(
                saved.getId(),
                saved.getProjectId(),
                saved.getStatus().name(),
                "system"
        );
        messagingTemplate.convertAndSend("/topic/tasks/" + saved.getProjectId(), message);
        log.debug("WebSocket update sent for task {} to project channel {}", id, saved.getProjectId());

        return TaskResponse.from(saved);
    }

    @Override
    @Transactional
    public void deleteTask(UUID id) {
        log.info("Deleting task: {}", id);
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    private Task findOrThrow(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }
}
