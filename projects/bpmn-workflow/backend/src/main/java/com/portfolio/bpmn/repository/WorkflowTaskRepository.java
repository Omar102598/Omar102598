package com.portfolio.bpmn.repository;

import com.portfolio.bpmn.model.WorkflowTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowTaskRepository extends JpaRepository<WorkflowTask, UUID> {

    Page<WorkflowTask> findByProcessInstanceId(UUID processInstanceId, Pageable pageable);

    Page<WorkflowTask> findByAssignee(String assignee, Pageable pageable);

    Page<WorkflowTask> findByStatus(WorkflowTask.Status status, Pageable pageable);

    List<WorkflowTask> findByProcessInstanceIdAndStatus(UUID processInstanceId, WorkflowTask.Status status);
}
