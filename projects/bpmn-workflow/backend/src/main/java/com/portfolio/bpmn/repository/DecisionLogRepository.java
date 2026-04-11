package com.portfolio.bpmn.repository;

import com.portfolio.bpmn.model.DecisionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DecisionLogRepository extends JpaRepository<DecisionLog, UUID> {

    List<DecisionLog> findByTaskId(UUID taskId);

    Page<DecisionLog> findByDecisionType(String decisionType, Pageable pageable);
}
