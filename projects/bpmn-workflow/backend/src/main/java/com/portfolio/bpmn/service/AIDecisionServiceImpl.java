package com.portfolio.bpmn.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.bpmn.model.DecisionLog;
import com.portfolio.bpmn.model.dto.AIDecisionRequest;
import com.portfolio.bpmn.model.dto.AIDecisionResponse;
import com.portfolio.bpmn.repository.DecisionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AIDecisionServiceImpl implements AIDecisionService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final DecisionLogRepository decisionLogRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Override
    @Transactional
    public AIDecisionResponse evaluateDecision(AIDecisionRequest request) {
        log.info("Evaluating AI decision for task: {}, type: {}", request.taskId(), request.decisionType());

        String outputDecision;
        String aiReasoning;
        double confidence;

        if (openAiApiKey != null && !openAiApiKey.isBlank()) {
            Map<String, Object> aiResult = callOpenAI(request.decisionType(), request.inputData());
            outputDecision = (String) aiResult.get("decision");
            aiReasoning = (String) aiResult.get("reasoning");
            confidence = (double) aiResult.get("confidence");
        } else {
            log.warn("OpenAI API key not configured, using fallback decision logic");
            outputDecision = "APPROVED";
            aiReasoning = "Fallback decision: AI service not configured.";
            confidence = 0.5;
        }

        DecisionLog decisionLog = DecisionLog.builder()
                .taskId(request.taskId())
                .decisionType(request.decisionType())
                .inputData(request.inputData())
                .outputDecision(outputDecision)
                .aiReasoning(aiReasoning)
                .confidence(confidence)
                .build();

        DecisionLog saved = decisionLogRepository.save(decisionLog);
        log.info("Decision logged with id: {}", saved.getId());
        return AIDecisionResponse.from(saved);
    }

    @Override
    public List<AIDecisionResponse> getDecisionsByTaskId(UUID taskId) {
        log.debug("Fetching decisions for task: {}", taskId);
        return decisionLogRepository.findByTaskId(taskId)
                .stream()
                .map(AIDecisionResponse::from)
                .toList();
    }

    @Override
    public Page<AIDecisionResponse> getAllDecisions(Pageable pageable) {
        log.debug("Fetching all decisions, page: {}", pageable.getPageNumber());
        return decisionLogRepository.findAll(pageable).map(AIDecisionResponse::from);
    }

    private Map<String, Object> callOpenAI(String decisionType, String inputData) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            String systemPrompt = """
                    You are a BPMN workflow decision engine. Given a decision type and input data, \
                    provide a structured decision with reasoning and confidence score (0.0-1.0). \
                    Respond in JSON format: {"decision": "...", "reasoning": "...", "confidence": 0.0}
                    """;

            String userPrompt = "Decision type: " + decisionType + "\nInput data: " + inputData;

            Map<String, Object> requestBody = Map.of(
                    "model", openAiModel,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ),
                    "temperature", 0.3
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<?, ?> response = restTemplate.postForObject(OPENAI_API_URL, entity, Map.class);

            if (response != null) {
                List<?> choices = (List<?>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
                    String content = (String) message.get("content");

                    JsonNode jsonResponse = objectMapper.readTree(content);
                    return Map.of(
                            "decision", jsonResponse.path("decision").asText("PENDING_REVIEW"),
                            "reasoning", jsonResponse.path("reasoning").asText(""),
                            "confidence", jsonResponse.path("confidence").asDouble(0.5)
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
        }

        return Map.of("decision", "PENDING_REVIEW", "reasoning", "AI evaluation failed", "confidence", 0.0);
    }
}
