package com.portfolio.pm.repository;

import com.portfolio.pm.model.Task;
import com.portfolio.pm.model.Task.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectId(UUID projectId);

    List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status);

    List<Task> findBySprint(int sprint);
}
