package com.portfolio.order.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderCreatedEvent(
        String orderNumber,
        UUID userId,
        BigDecimal totalAmount,
        String shippingAddress,
        LocalDateTime createdAt
) {}
