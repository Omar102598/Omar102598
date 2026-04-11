package com.portfolio.ai.service;

import com.portfolio.ai.model.AiRequest;
import com.portfolio.ai.model.AiResponse;

public interface AiService {

    AiResponse getRecommendation(AiRequest request);

    AiResponse analyzeData(AiRequest request);

    AiResponse summarize(AiRequest request);
}
