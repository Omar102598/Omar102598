package com.portfolio.ai.controller;

import com.portfolio.ai.model.AiRequest;
import com.portfolio.ai.model.AiResponse;
import com.portfolio.ai.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI Controller - Provides AI-powered endpoints for recommendations, analysis, and summarization.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;

    /**
     * Generate AI-powered recommendations based on the provided context.
     *
     * @param request the AI request containing prompt and context
     * @return AI-generated recommendations
     */
    @PostMapping("/recommend")
    public ResponseEntity<AiResponse> getRecommendation(@Valid @RequestBody AiRequest request) {
        log.info("Received recommendation request: {}", request.prompt());
        AiResponse response = aiService.getRecommendation(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Analyze data using AI and return insights.
     *
     * @param request the AI request containing data to analyze
     * @return AI-generated analysis
     */
    @PostMapping("/analyze")
    public ResponseEntity<AiResponse> analyzeData(@Valid @RequestBody AiRequest request) {
        log.info("Received analysis request: {}", request.prompt());
        AiResponse response = aiService.analyzeData(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Summarize text using AI.
     *
     * @param request the AI request containing text to summarize
     * @return AI-generated summary
     */
    @PostMapping("/summarize")
    public ResponseEntity<AiResponse> summarize(@Valid @RequestBody AiRequest request) {
        log.info("Received summarization request: {}", request.prompt());
        AiResponse response = aiService.summarize(request);
        return ResponseEntity.ok(response);
    }
}
