package com.portfolio.order.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderRequest(
        @NotNull(message = "User ID is required")
        UUID userId,

        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        List<OrderItemDto> items,

        @NotBlank(message = "Shipping address is required")
        String shippingAddress,

        String notes
) {
    public record OrderItemDto(
            @NotBlank(message = "Product ID is required")
            String productId,

            @NotBlank(message = "Product name is required")
            String productName,

            @NotNull(message = "Quantity is required")
            @Min(value = 1, message = "Quantity must be at least 1")
            Integer quantity,

            @NotNull(message = "Unit price is required")
            BigDecimal unitPrice
    ) {}
}
