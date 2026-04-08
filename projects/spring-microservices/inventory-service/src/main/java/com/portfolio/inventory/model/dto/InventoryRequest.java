package com.portfolio.inventory.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InventoryRequest(
        @NotBlank(message = "SKU code is required")
        String skuCode,

        @NotBlank(message = "Product name is required")
        String productName,

        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity must be >= 0")
        Integer quantity,

        @Min(value = 0, message = "Reorder level must be >= 0")
        Integer reorderLevel,

        @Min(value = 1, message = "Reorder quantity must be >= 1")
        Integer reorderQuantity,

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.01", message = "Unit price must be >= 0.01")
        BigDecimal unitPrice,

        @NotBlank(message = "Warehouse is required")
        String warehouse
) {
}
