package com.portfolio.bpmn.service;

import com.portfolio.bpmn.exception.ResourceNotFoundException;
import com.portfolio.bpmn.model.ProcessInstance;
import com.portfolio.bpmn.model.dto.ProcessRequest;
import com.portfolio.bpmn.model.dto.ProcessResponse;
import com.portfolio.bpmn.repository.ProcessInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProcessServiceImpl implements ProcessService {

    private final ProcessInstanceRepository processInstanceRepository;

    @Override
    @Transactional
    public ProcessResponse startProcess(ProcessRequest request) {
        log.info("Starting process with definition key: {}", request.processDefinitionKey());

        if (request.businessKey() != null && processInstanceRepository.existsByBusinessKey(request.businessKey())) {
            throw new DataIntegrityViolationException(
                    "Process with business key " + request.businessKey() + " already exists");
        }

        ProcessInstance instance = ProcessInstance.builder()
                .processDefinitionKey(request.processDefinitionKey())
                .businessKey(request.businessKey())
                .initiatedBy(request.initiatedBy())
                .variables(request.variables())
                .status(ProcessInstance.Status.ACTIVE)
                .build();

        ProcessInstance saved = processInstanceRepository.save(instance);
        log.info("Process started with id: {}", saved.getId());
        return ProcessResponse.from(saved);
    }

    @Override
    public ProcessResponse getProcessById(UUID id) {
        log.debug("Fetching process by id: {}", id);
        ProcessInstance instance = findOrThrow(id);
        return ProcessResponse.from(instance);
    }

    @Override
    public Page<ProcessResponse> getAllProcesses(Pageable pageable) {
        log.debug("Fetching all processes, page: {}", pageable.getPageNumber());
        return processInstanceRepository.findAll(pageable).map(ProcessResponse::from);
    }

    @Override
    public Page<ProcessResponse> getProcessesByStatus(ProcessInstance.Status status, Pageable pageable) {
        log.debug("Fetching processes by status: {}", status);
        return processInstanceRepository.findByStatus(status, pageable).map(ProcessResponse::from);
    }

    @Override
    @Transactional
    public ProcessResponse suspendProcess(UUID id) {
        log.info("Suspending process: {}", id);
        ProcessInstance instance = findOrThrow(id);
        instance.setStatus(ProcessInstance.Status.SUSPENDED);
        return ProcessResponse.from(processInstanceRepository.save(instance));
    }

    @Override
    @Transactional
    public ProcessResponse resumeProcess(UUID id) {
        log.info("Resuming process: {}", id);
        ProcessInstance instance = findOrThrow(id);
        instance.setStatus(ProcessInstance.Status.ACTIVE);
        return ProcessResponse.from(processInstanceRepository.save(instance));
    }

    @Override
    @Transactional
    public ProcessResponse completeProcess(UUID id) {
        log.info("Completing process: {}", id);
        ProcessInstance instance = findOrThrow(id);
        instance.setStatus(ProcessInstance.Status.COMPLETED);
        return ProcessResponse.from(processInstanceRepository.save(instance));
    }

    @Override
    @Transactional
    public ProcessResponse terminateProcess(UUID id) {
        log.info("Terminating process: {}", id);
        ProcessInstance instance = findOrThrow(id);
        instance.setStatus(ProcessInstance.Status.TERMINATED);
        return ProcessResponse.from(processInstanceRepository.save(instance));
    }

    @Override
    @Transactional
    public void deleteProcess(UUID id) {
        log.info("Deleting process: {}", id);
        if (!processInstanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Process not found with id: " + id);
        }
        processInstanceRepository.deleteById(id);
    }

    private ProcessInstance findOrThrow(UUID id) {
        return processInstanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Process not found with id: " + id));
    }
}
