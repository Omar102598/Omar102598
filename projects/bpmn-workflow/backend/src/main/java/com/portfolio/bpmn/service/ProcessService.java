package com.portfolio.bpmn.service;

import com.portfolio.bpmn.model.ProcessInstance;
import com.portfolio.bpmn.model.dto.ProcessRequest;
import com.portfolio.bpmn.model.dto.ProcessResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProcessService {

    ProcessResponse startProcess(ProcessRequest request);

    ProcessResponse getProcessById(UUID id);

    Page<ProcessResponse> getAllProcesses(Pageable pageable);

    Page<ProcessResponse> getProcessesByStatus(ProcessInstance.Status status, Pageable pageable);

    ProcessResponse suspendProcess(UUID id);

    ProcessResponse resumeProcess(UUID id);

    ProcessResponse completeProcess(UUID id);

    ProcessResponse terminateProcess(UUID id);

    void deleteProcess(UUID id);
}
