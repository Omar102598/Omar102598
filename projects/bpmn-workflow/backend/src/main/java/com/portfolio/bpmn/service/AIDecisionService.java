package com.portfolio.bpmn.service;

import com.portfolio.bpmn.model.dto.AIDecisionRequest;
import com.portfolio.bpmn.model.dto.AIDecisionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AIDecisionService {

    AIDecisionResponse evaluateDecision(AIDecisionRequest request);

    List<AIDecisionResponse> getDecisionsByTaskId(UUID taskId);

    Page<AIDecisionResponse> getAllDecisions(Pageable pageable);
}
