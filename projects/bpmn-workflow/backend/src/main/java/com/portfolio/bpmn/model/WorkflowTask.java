package com.portfolio.bpmn.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "process_instance_id", nullable = false)
    private UUID processInstanceId;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(name = "assignee")
    private String assignee;

    @Column(name = "candidate_group")
    private String candidateGroup;

    @Column(name = "priority")
    @Builder.Default
    private int priority = 50;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Status {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
