package com.portfolio.gateway.config;

import com.portfolio.gateway.filter.AuthenticationFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;
    private final KeyResolver keyResolver;

    public GatewayConfig(AuthenticationFilter authenticationFilter, KeyResolver keyResolver) {
        this.authenticationFilter = authenticationFilter;
        this.keyResolver = keyResolver;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/api/users/**")
                        .filters(f -> f
                                .filter(authenticationFilter)
                                .circuitBreaker(cb -> cb
                                        .setName("userServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback"))
                                .requestRateLimiter(rl -> rl
                                        .setKeyResolver(keyResolver)
                                        .setRateLimiter(null))
                                .stripPrefix(0))
                        .uri("lb://user-service"))

                .route("order-service", r -> r.path("/api/orders/**")
                        .filters(f -> f
                                .filter(authenticationFilter)
                                .circuitBreaker(cb -> cb
                                        .setName("orderServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback"))
                                .requestRateLimiter(rl -> rl
                                        .setKeyResolver(keyResolver)
                                        .setRateLimiter(null))
                                .stripPrefix(0))
                        .uri("lb://order-service"))

                .route("inventory-service", r -> r.path("/api/inventory/**")
                        .filters(f -> f
                                .filter(authenticationFilter)
                                .circuitBreaker(cb -> cb
                                        .setName("inventoryServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback"))
                                .requestRateLimiter(rl -> rl
                                        .setKeyResolver(keyResolver)
                                        .setRateLimiter(null))
                                .stripPrefix(0))
                        .uri("lb://inventory-service"))

                .route("ai-service", r -> r.path("/api/ai/**")
                        .filters(f -> f
                                .filter(authenticationFilter)
                                .circuitBreaker(cb -> cb
                                        .setName("aiServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback"))
                                .requestRateLimiter(rl -> rl
                                        .setKeyResolver(keyResolver)
                                        .setRateLimiter(null))
                                .stripPrefix(0))
                        .uri("lb://ai-service"))

                .build();
    }
}
