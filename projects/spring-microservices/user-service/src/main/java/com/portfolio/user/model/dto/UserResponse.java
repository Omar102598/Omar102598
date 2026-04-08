package com.portfolio.user.model.dto;

import com.portfolio.user.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String role,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
