package com.portfolio.pm.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Project Management API",
                version = "1.0.0",
                description = "Full-Stack Project Management Platform API with AI-powered sprint planning"
        )
)
public class OpenApiConfig {

    @Bean
    public OpenAPI projectManagementOpenAPI() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Project Management API")
                        .description("Full-Stack Project Management Platform API with AI-powered sprint planning and WebSocket collaboration")
                        .version("1.0.0")
                        .license(new License().name("MIT")));
    }
}
