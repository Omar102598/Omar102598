package com.portfolio.ai.service;

import org.springframework.stereotype.Service;

@Service
public class PromptService {

    public String buildRecommendationPrompt(String context) {
        return """
                You are an intelligent recommendation engine. Based on the following context, \
                provide personalized and actionable recommendations.

                Context:
                %s

                Please provide:
                1. Top 3 recommendations with brief explanations
                2. Priority ranking for each recommendation
                3. Expected impact or benefit
                """.formatted(context);
    }

    public String buildAnalysisPrompt(String data) {
        return """
                You are a data analysis expert. Analyze the following data and provide \
                comprehensive insights.

                Data:
                %s

                Please provide:
                1. Key findings and patterns
                2. Statistical observations
                3. Anomalies or notable trends
                4. Actionable conclusions
                """.formatted(data);
    }

    public String buildSummaryPrompt(String text) {
        return """
                You are an expert summarizer. Provide a clear, concise summary of the \
                following text while retaining all key information.

                Text:
                %s

                Please provide:
                1. Executive summary (2-3 sentences)
                2. Key points (bullet list)
                3. Important details that should not be overlooked
                """.formatted(text);
    }
}
