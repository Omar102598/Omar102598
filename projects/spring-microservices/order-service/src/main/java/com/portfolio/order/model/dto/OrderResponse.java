package com.portfolio.order.model.dto;

import com.portfolio.order.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderResponse(
        Long id,
        String orderNumber,
        UUID userId,
        String items,
        BigDecimal totalAmount,
        Order.OrderStatus status,
        String shippingAddress,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getItems(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getNotes(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
