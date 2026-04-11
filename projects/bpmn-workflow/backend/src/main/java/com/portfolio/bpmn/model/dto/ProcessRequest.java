package com.portfolio.bpmn.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ProcessRequest(
        @NotBlank(message = "Process definition key is required")
        String processDefinitionKey,

        String businessKey,

        @NotBlank(message = "Initiator is required")
        String initiatedBy,

        String variables
) {}
