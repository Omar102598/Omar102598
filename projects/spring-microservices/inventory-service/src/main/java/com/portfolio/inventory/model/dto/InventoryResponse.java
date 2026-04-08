package com.portfolio.inventory.model.dto;

import com.portfolio.inventory.model.Inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryResponse(
        Long id,
        String skuCode,
        String productName,
        Integer quantity,
        Integer reservedQuantity,
        Integer availableQuantity,
        Integer reorderLevel,
        BigDecimal unitPrice,
        String warehouse,
        Inventory.InventoryStatus status,
        LocalDateTime updatedAt
) {
    public static InventoryResponse from(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getSkuCode(),
                inventory.getProductName(),
                inventory.getQuantity(),
                inventory.getReservedQuantity(),
                inventory.getAvailableQuantity(),
                inventory.getReorderLevel(),
                inventory.getUnitPrice(),
                inventory.getWarehouse(),
                inventory.getStatus(),
                inventory.getUpdatedAt()
        );
    }
}
