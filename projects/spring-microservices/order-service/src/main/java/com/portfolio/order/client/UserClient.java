package com.portfolio.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service", fallback = UserClient.UserClientFallback.class)
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserResponse getUserById(@PathVariable("id") UUID id);

    record UserResponse(
            UUID id,
            String username,
            String email,
            String firstName,
            String lastName
    ) {}

    @Component
    class UserClientFallback implements UserClient {

        @Override
        public UserResponse getUserById(UUID id) {
            return new UserResponse(null, "unknown", "unknown@fallback.com", "Unknown", "User");
        }
    }
}
