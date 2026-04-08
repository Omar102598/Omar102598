package com.portfolio.user.service;

import com.portfolio.user.model.User;
import com.portfolio.user.model.dto.UserRequest;
import com.portfolio.user.model.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    UserResponse createUser(UserRequest request);

    UserResponse getUserById(UUID id);

    UserResponse getUserByEmail(String email);

    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse updateUser(UUID id, UserRequest request);

    void deleteUser(UUID id);

    Page<UserResponse> searchUsers(String query, Pageable pageable);

    Page<UserResponse> getUsersByStatus(User.Status status, Pageable pageable);
}
