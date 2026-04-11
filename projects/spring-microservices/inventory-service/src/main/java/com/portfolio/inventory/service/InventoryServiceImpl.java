package com.portfolio.inventory.service;

import com.portfolio.inventory.model.Inventory;
import com.portfolio.inventory.model.Inventory.InventoryStatus;
import com.portfolio.inventory.model.dto.InventoryRequest;
import com.portfolio.inventory.model.dto.InventoryResponse;
import com.portfolio.inventory.repository.InventoryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private static final int MAX_RETRIES = 3;

    private final InventoryRepository inventoryRepository;

    @Override
    @CacheEvict(value = "inventory", allEntries = true)
    public InventoryResponse createInventory(InventoryRequest request) {
        log.info("Creating inventory for SKU: {}", request.skuCode());

        if (inventoryRepository.existsBySkuCode(request.skuCode())) {
            throw new IllegalArgumentException("Inventory already exists for SKU: " + request.skuCode());
        }

        Inventory inventory = Inventory.builder()
                .skuCode(request.skuCode())
                .productName(request.productName())
                .quantity(request.quantity())
                .reorderLevel(request.reorderLevel() != null ? request.reorderLevel() : 10)
                .reorderQuantity(request.reorderQuantity() != null ? request.reorderQuantity() : 100)
                .unitPrice(request.unitPrice())
                .warehouse(request.warehouse())
                .status(computeStatus(request.quantity(), request.reorderLevel() != null ? request.reorderLevel() : 10))
                .build();

        Inventory saved = inventoryRepository.save(inventory);
        log.info("Inventory created with ID: {} for SKU: {}", saved.getId(), saved.getSkuCode());
        return InventoryResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "inventory", key = "#id")
    public InventoryResponse getInventoryById(Long id) {
        log.debug("Fetching inventory by ID: {}", id);
        Inventory inventory = findInventoryById(id);
        return InventoryResponse.from(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "inventory", key = "#skuCode")
    public InventoryResponse getInventoryBySkuCode(String skuCode) {
        log.debug("Fetching inventory by SKU: {}", skuCode);
        Inventory inventory = findInventoryBySkuCode(skuCode);
        return InventoryResponse.from(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryResponse> getAllInventory(Pageable pageable) {
        log.debug("Fetching all inventory, page: {}", pageable.getPageNumber());
        return inventoryRepository.findAll(pageable).map(InventoryResponse::from);
    }

    @Override
    @CacheEvict(value = "inventory", allEntries = true)
    public InventoryResponse updateInventory(Long id, InventoryRequest request) {
        log.info("Updating inventory ID: {}", id);
        Inventory inventory = findInventoryById(id);

        inventory.setSkuCode(request.skuCode());
        inventory.setProductName(request.productName());
        inventory.setQuantity(request.quantity());
        inventory.setReorderLevel(request.reorderLevel() != null ? request.reorderLevel() : inventory.getReorderLevel());
        inventory.setReorderQuantity(request.reorderQuantity() != null ? request.reorderQuantity() : inventory.getReorderQuantity());
        inventory.setUnitPrice(request.unitPrice());
        inventory.setWarehouse(request.warehouse());
        inventory.setStatus(computeStatus(request.quantity(), inventory.getReorderLevel()));

        Inventory saved = inventoryRepository.save(inventory);
        log.info("Inventory updated for SKU: {}", saved.getSkuCode());
        return InventoryResponse.from(saved);
    }

    @Override
    @CacheEvict(value = "inventory", allEntries = true)
    public void deleteInventory(Long id) {
        log.info("Deleting inventory ID: {}", id);
        Inventory inventory = findInventoryById(id);
        inventoryRepository.delete(inventory);
        log.info("Inventory deleted for SKU: {}", inventory.getSkuCode());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkStock(String skuCode) {
        log.debug("Checking stock for SKU: {}", skuCode);
        Inventory inventory = findInventoryBySkuCode(skuCode);
        return inventory.getAvailableQuantity() > 0;
    }

    @Override
    @CacheEvict(value = "inventory", allEntries = true)
    public InventoryResponse reserveStock(String skuCode, int quantity) {
        log.info("Reserving {} units for SKU: {}", quantity, skuCode);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                Inventory inventory = findInventoryBySkuCode(skuCode);

                if (inventory.getAvailableQuantity() < quantity) {
                    throw new IllegalStateException(
                            String.format("Insufficient stock for SKU: %s. Available: %d, Requested: %d",
                                    skuCode, inventory.getAvailableQuantity(), quantity));
                }

                inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
                inventory.setStatus(computeStatus(inventory.getQuantity(), inventory.getReorderLevel()));

                Inventory saved = inventoryRepository.save(inventory);
                log.info("Reserved {} units for SKU: {}. New reserved total: {}",
                        quantity, skuCode, saved.getReservedQuantity());
                return InventoryResponse.from(saved);

            } catch (OptimisticLockException e) {
                log.warn("Optimistic lock conflict on attempt {}/{} for SKU: {}", attempt, MAX_RETRIES, skuCode);
                if (attempt == MAX_RETRIES) {
                    throw new IllegalStateException(
                            "Unable to reserve stock after " + MAX_RETRIES + " attempts due to concurrent updates", e);
                }
            }
        }

        throw new IllegalStateException("Unexpected error during stock reservation for SKU: " + skuCode);
    }

    @Override
    @CacheEvict(value = "inventory", allEntries = true)
    public InventoryResponse releaseStock(String skuCode, int quantity) {
        log.info("Releasing {} units for SKU: {}", quantity, skuCode);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                Inventory inventory = findInventoryBySkuCode(skuCode);

                int currentReserved = inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : 0;
                if (currentReserved < quantity) {
                    throw new IllegalStateException(
                            String.format("Cannot release %d units for SKU: %s. Only %d reserved",
                                    quantity, skuCode, currentReserved));
                }

                inventory.setReservedQuantity(currentReserved - quantity);
                inventory.setStatus(computeStatus(inventory.getQuantity(), inventory.getReorderLevel()));

                Inventory saved = inventoryRepository.save(inventory);
                log.info("Released {} units for SKU: {}. New reserved total: {}",
                        quantity, skuCode, saved.getReservedQuantity());
                return InventoryResponse.from(saved);

            } catch (OptimisticLockException e) {
                log.warn("Optimistic lock conflict on attempt {}/{} for SKU: {}", attempt, MAX_RETRIES, skuCode);
                if (attempt == MAX_RETRIES) {
                    throw new IllegalStateException(
                            "Unable to release stock after " + MAX_RETRIES + " attempts due to concurrent updates", e);
                }
            }
        }

        throw new IllegalStateException("Unexpected error during stock release for SKU: " + skuCode);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Boolean> batchCheckStock(List<String> skuCodes) {
        log.debug("Batch checking stock for {} SKUs", skuCodes.size());
        List<Inventory> inventories = inventoryRepository.findBySkuCodeIn(skuCodes);

        Map<String, Boolean> stockMap = inventories.stream()
                .collect(Collectors.toMap(Inventory::getSkuCode, inv -> inv.getAvailableQuantity() > 0));

        // Mark missing SKUs as unavailable
        skuCodes.forEach(sku -> stockMap.putIfAbsent(sku, false));

        return stockMap;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockItems() {
        log.debug("Fetching low stock items");
        return inventoryRepository.findLowStockItems().stream()
                .map(InventoryResponse::from)
                .toList();
    }

    @Override
    @CacheEvict(value = "inventory", allEntries = true)
    public InventoryResponse updateStockQuantity(Long id, int quantity) {
        log.info("Updating stock quantity for ID: {} to {}", id, quantity);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                Inventory inventory = findInventoryById(id);
                inventory.setQuantity(quantity);
                inventory.setStatus(computeStatus(quantity, inventory.getReorderLevel()));

                Inventory saved = inventoryRepository.save(inventory);
                log.info("Stock quantity updated for SKU: {} to {}", saved.getSkuCode(), quantity);
                return InventoryResponse.from(saved);

            } catch (OptimisticLockException e) {
                log.warn("Optimistic lock conflict on attempt {}/{} for ID: {}", attempt, MAX_RETRIES, id);
                if (attempt == MAX_RETRIES) {
                    throw new IllegalStateException(
                            "Unable to update stock after " + MAX_RETRIES + " attempts due to concurrent updates", e);
                }
            }
        }

        throw new IllegalStateException("Unexpected error during stock quantity update for ID: " + id);
    }

    private Inventory findInventoryById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found with ID: " + id));
    }

    private Inventory findInventoryBySkuCode(String skuCode) {
        return inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for SKU: " + skuCode));
    }

    private InventoryStatus computeStatus(int quantity, int reorderLevel) {
        if (quantity <= 0) {
            return InventoryStatus.OUT_OF_STOCK;
        } else if (quantity <= reorderLevel) {
            return InventoryStatus.LOW_STOCK;
        }
        return InventoryStatus.IN_STOCK;
    }
}
