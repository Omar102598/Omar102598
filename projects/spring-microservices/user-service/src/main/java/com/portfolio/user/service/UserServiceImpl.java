package com.portfolio.user.service;

import com.portfolio.user.exception.UserNotFoundException;
import com.portfolio.user.model.User;
import com.portfolio.user.model.dto.UserRequest;
import com.portfolio.user.model.dto.UserResponse;
import com.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse createUser(UserRequest request) {
        log.info("Creating user with email: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            throw new DataIntegrityViolationException(
                    "User with email " + request.email() + " already exists");
        }

        User user = mapToEntity(request);
        User savedUser = userRepository.save(user);

        log.info("User created successfully with id: {}", savedUser.getId());
        return UserResponse.from(savedUser);
    }

    @Override
    @Cacheable(value = "users", key = "#id")
    public UserResponse getUserById(UUID id) {
        log.debug("Fetching user by id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return UserResponse.from(user);
    }

    @Override
    @Cacheable(value = "users", key = "#email")
    public UserResponse getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User with email " + email + " not found"));

        return UserResponse.from(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        log.debug("Fetching all users, page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());

        return userRepository.findAll(pageable)
                .map(UserResponse::from);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse updateUser(UUID id, UserRequest request) {
        log.info("Updating user with id: {}", id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        // Check email uniqueness if email is being changed
        if (!existingUser.getEmail().equals(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new DataIntegrityViolationException(
                    "User with email " + request.email() + " already exists");
        }

        existingUser.setEmail(request.email());
        existingUser.setFirstName(request.firstName());
        existingUser.setLastName(request.lastName());
        existingUser.setPassword(request.password());

        if (request.role() != null && !request.role().isBlank()) {
            existingUser.setRole(User.Role.valueOf(request.role().toUpperCase()));
        }

        User updatedUser = userRepository.save(existingUser);

        log.info("User updated successfully with id: {}", updatedUser.getId());
        return UserResponse.from(updatedUser);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(UUID id) {
        log.info("Deleting user with id: {}", id);

        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }

        userRepository.deleteById(id);
        log.info("User deleted successfully with id: {}", id);
    }

    @Override
    public Page<UserResponse> searchUsers(String query, Pageable pageable) {
        log.debug("Searching users with query: {}", query);

        return userRepository.searchByFirstNameOrLastName(query, pageable)
                .map(UserResponse::from);
    }

    @Override
    public Page<UserResponse> getUsersByStatus(User.Status status, Pageable pageable) {
        log.debug("Fetching users by status: {}", status);

        return userRepository.findByStatus(status, pageable)
                .map(UserResponse::from);
    }

    private User mapToEntity(UserRequest request) {
        User.Role role = User.Role.USER;
        if (request.role() != null && !request.role().isBlank()) {
            role = User.Role.valueOf(request.role().toUpperCase());
        }

        return User.builder()
                .email(request.email())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .password(request.password())
                .role(role)
                .status(User.Status.ACTIVE)
                .build();
    }
}
