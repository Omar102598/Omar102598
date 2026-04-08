package com.portfolio.user.controller;

import com.portfolio.user.model.User;
import com.portfolio.user.model.dto.UserRequest;
import com.portfolio.user.model.dto.UserResponse;
import com.portfolio.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user", description = "Creates a new user with the provided details")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "409", description = "User with email already exists")
    })
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves a user by their unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieves a paginated list of all users")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        Page<UserResponse> response = userService.getAllUsers(pageable);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Updates an existing user with the provided details")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "409", description = "Email already in use")
    })
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Deletes a user by their unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Searches users by first name or last name")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results retrieved successfully")
    })
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        Page<UserResponse> response = userService.searchUsers(query, pageable);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email", description = "Retrieves a user by their email address")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get users by status", description = "Retrieves a paginated list of users filtered by status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public ResponseEntity<Page<UserResponse>> getUsersByStatus(
            @PathVariable User.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> response = userService.getUsersByStatus(status, pageable);

        return ResponseEntity.ok(response);
    }
}
