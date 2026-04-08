package com.portfolio.user.repository;

import com.portfolio.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByStatus(User.Status status, Pageable pageable);

    List<User> findByRole(User.Role role);

    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchByFirstNameOrLastName(@Param("query") String query, Pageable pageable);
}
