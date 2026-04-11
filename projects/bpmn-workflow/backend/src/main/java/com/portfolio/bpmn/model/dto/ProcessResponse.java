package com.portfolio.bpmn.model.dto;

import com.portfolio.bpmn.model.ProcessInstance;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProcessResponse(
        UUID id,
        String processDefinitionKey,
        String businessKey,
        ProcessInstance.Status status,
        String initiatedBy,
        String variables,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProcessResponse from(ProcessInstance instance) {
        return new ProcessResponse(
                instance.getId(),
                instance.getProcessDefinitionKey(),
                instance.getBusinessKey(),
                instance.getStatus(),
                instance.getInitiatedBy(),
                instance.getVariables(),
                instance.getCreatedAt(),
                instance.getUpdatedAt()
        );
    }
}
