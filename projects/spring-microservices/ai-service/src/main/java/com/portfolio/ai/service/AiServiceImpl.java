package com.portfolio.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.ai.model.AiRequest;
import com.portfolio.ai.model.AiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiServiceImpl implements AiService {

    private final WebClient openAiWebClient;
    private final String model;
    private final PromptService promptService;
    private final ObjectMapper objectMapper;

    public AiServiceImpl(WebClient openAiWebClient,
                         @Qualifier("openAiModel") String model,
                         PromptService promptService,
                         ObjectMapper objectMapper) {
        this.openAiWebClient = openAiWebClient;
        this.model = model;
        this.promptService = promptService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Cacheable(value = "recommendations", key = "#request.prompt()")
    public AiResponse getRecommendation(AiRequest request) {
        String prompt = promptService.buildRecommendationPrompt(
                request.context() != null ? request.context() : request.prompt());
        return callOpenAi(prompt, request);
    }

    @Override
    @Cacheable(value = "analyses", key = "#request.prompt()")
    public AiResponse analyzeData(AiRequest request) {
        String prompt = promptService.buildAnalysisPrompt(request.prompt());
        return callOpenAi(prompt, request);
    }

    @Override
    @Cacheable(value = "summaries", key = "#request.prompt()")
    public AiResponse summarize(AiRequest request) {
        String prompt = promptService.buildSummaryPrompt(request.prompt());
        return callOpenAi(prompt, request);
    }

    private AiResponse callOpenAi(String prompt, AiRequest request) {
        long startTime = System.currentTimeMillis();

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a helpful assistant."),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", request.maxTokens(),
                "temperature", request.temperature()
        );

        try {
            log.info("Calling OpenAI API with model: {}", model);

            String responseBody = openAiWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseJson = objectMapper.readTree(responseBody);
            String content = responseJson
                    .path("choices").get(0)
                    .path("message").path("content").asText();
            int tokensUsed = responseJson
                    .path("usage").path("total_tokens").asInt();
            String responseModel = responseJson
                    .path("model").asText();

            long processingTime = System.currentTimeMillis() - startTime;
            log.info("OpenAI response received in {}ms, tokens used: {}", processingTime, tokensUsed);

            return new AiResponse(content, responseModel, tokensUsed, processingTime);

        } catch (WebClientResponseException e) {
            log.error("OpenAI API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return buildFallbackResponse(startTime, "AI service temporarily unavailable. Please try again later.");
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage(), e);
            return buildFallbackResponse(startTime, "An error occurred while processing your request.");
        }
    }

    private AiResponse buildFallbackResponse(long startTime, String message) {
        long processingTime = System.currentTimeMillis() - startTime;
        return new AiResponse(message, "fallback", 0, processingTime);
    }
}
