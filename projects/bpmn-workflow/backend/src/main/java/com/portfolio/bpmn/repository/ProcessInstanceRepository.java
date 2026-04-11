package com.portfolio.bpmn.repository;

import com.portfolio.bpmn.model.ProcessInstance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcessInstanceRepository extends JpaRepository<ProcessInstance, UUID> {

    Optional<ProcessInstance> findByBusinessKey(String businessKey);

    Page<ProcessInstance> findByStatus(ProcessInstance.Status status, Pageable pageable);

    Page<ProcessInstance> findByInitiatedBy(String initiatedBy, Pageable pageable);

    boolean existsByBusinessKey(String businessKey);
}
