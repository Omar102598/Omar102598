package com.portfolio.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@FeignClient(name = "ai-service", fallback = AiClient.AiClientFallback.class)
public interface AiClient {

    @PostMapping("/api/ai/recommendations")
    RecommendationResponse getRecommendations(@RequestBody RecommendationRequest request);

    record RecommendationRequest(
            UUID userId,
            List<String> orderHistory
    ) {}

    record RecommendationResponse(
            UUID userId,
            List<String> recommendations
    ) {}

    @Component
    class AiClientFallback implements AiClient {

        @Override
        public RecommendationResponse getRecommendations(RecommendationRequest request) {
            return new RecommendationResponse(
                    request.userId(),
                    Collections.singletonList("Unable to fetch recommendations at this time. Please try again later.")
            );
        }
    }
}
