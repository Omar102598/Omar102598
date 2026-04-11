package com.portfolio.pm.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.pm.model.dto.AISprintPlanRequest;
import com.portfolio.pm.model.dto.AISprintPlanResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AISprintPlannerServiceImpl implements AISprintPlannerService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Override
    public AISprintPlanResponse planSprint(AISprintPlanRequest request) {
        log.info("Planning sprint for project: {}, goal: {}", request.projectId(), request.sprintGoal());

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            log.warn("OpenAI API key not configured, using fallback sprint plan");
            return new AISprintPlanResponse(
                    "Sprint 1",
                    request.taskIds() != null ? request.taskIds().subList(0, Math.min(5, request.taskIds().size())) : List.of(),
                    request.availableStoryPoints(),
                    "Fallback plan: AI service not configured. Selected first available tasks up to story point capacity."
            );
        }

        try {
            String prompt = buildSprintPlanPrompt(request);
            String response = callOpenAI(prompt,
                    "You are an agile sprint planning assistant. Respond in JSON format: " +
                    "{\"sprintName\": \"...\", \"recommendedTaskIds\": [...], \"estimatedVelocity\": 0, \"rationale\": \"...\"}");

            JsonNode json = objectMapper.readTree(response);
            List<UUID> recommendedTasks = new ArrayList<>();
            JsonNode taskIdsNode = json.path("recommendedTaskIds");
            if (taskIdsNode.isArray()) {
                for (JsonNode node : taskIdsNode) {
                    try {
                        recommendedTasks.add(UUID.fromString(node.asText()));
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid UUID in AI response: {}", node.asText());
                    }
                }
            }

            return new AISprintPlanResponse(
                    json.path("sprintName").asText("AI Sprint"),
                    recommendedTasks,
                    json.path("estimatedVelocity").asInt(request.availableStoryPoints()),
                    json.path("rationale").asText("")
            );
        } catch (Exception e) {
            log.error("Error calling OpenAI for sprint planning: {}", e.getMessage());
            return new AISprintPlanResponse(
                    "Sprint",
                    List.of(),
                    request.availableStoryPoints(),
                    "Sprint planning failed: " + e.getMessage()
            );
        }
    }

    @Override
    public int estimateTaskStoryPoints(String taskTitle, String taskDescription) {
        log.info("Estimating story points for task: {}", taskTitle);

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            log.warn("OpenAI API key not configured, returning default story point estimate");
            return 3;
        }

        try {
            String prompt = "Estimate story points (1, 2, 3, 5, 8, or 13) for this task:\n" +
                    "Title: " + taskTitle + "\nDescription: " + (taskDescription != null ? taskDescription : "N/A") +
                    "\nRespond with only the number.";

            String response = callOpenAI(prompt,
                    "You are an agile estimation expert. Respond with only a single integer story point value: 1, 2, 3, 5, 8, or 13.");

            String trimmed = response.trim().replaceAll("[^0-9]", "");
            int points = Integer.parseInt(trimmed);
            int[] validPoints = {1, 2, 3, 5, 8, 13};
            for (int valid : validPoints) {
                if (valid == points) return points;
            }
            return 3;
        } catch (Exception e) {
            log.error("Error estimating story points: {}", e.getMessage());
            return 3;
        }
    }

    private String buildSprintPlanPrompt(AISprintPlanRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Plan a sprint with the following details:\n");
        sb.append("Project ID: ").append(request.projectId()).append("\n");
        sb.append("Sprint Goal: ").append(request.sprintGoal()).append("\n");
        sb.append("Available Story Points: ").append(request.availableStoryPoints()).append("\n");
        if (request.taskIds() != null && !request.taskIds().isEmpty()) {
            sb.append("Available Task IDs: ").append(request.taskIds()).append("\n");
        }
        sb.append("Select tasks that fit within the story point capacity and align with the sprint goal.");
        return sb.toString();
    }

    private String callOpenAI(String userPrompt, String systemPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

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
                return (String) message.get("content");
            }
        }
        throw new RuntimeException("Empty response from OpenAI");
    }
}
