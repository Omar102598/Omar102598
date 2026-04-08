package com.portfolio.order.repository;

import com.portfolio.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(UUID userId);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserIdAndStatus(UUID userId, Order.OrderStatus status);

    long countByStatus(Order.OrderStatus status);
}
