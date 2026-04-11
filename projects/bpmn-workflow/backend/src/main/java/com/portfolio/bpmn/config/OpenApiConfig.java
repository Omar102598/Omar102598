package com.portfolio.bpmn.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI bpmnWorkflowOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BPMN Workflow Automation Engine API")
                        .description("REST API for managing BPMN process instances, workflow tasks, and AI-powered decision nodes")
                        .version("1.0.0")
                        .license(new License().name("MIT")))
                .externalDocs(new ExternalDocumentation()
                        .description("BPMN Workflow Documentation")
                        .url("https://github.com/portfolio/bpmn-workflow"));
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
