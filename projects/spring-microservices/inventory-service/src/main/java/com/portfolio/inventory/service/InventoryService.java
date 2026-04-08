package com.portfolio.inventory.service;

import com.portfolio.inventory.model.dto.InventoryRequest;
import com.portfolio.inventory.model.dto.InventoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface InventoryService {

    InventoryResponse createInventory(InventoryRequest request);

    InventoryResponse getInventoryById(Long id);

    InventoryResponse getInventoryBySkuCode(String skuCode);

    Page<InventoryResponse> getAllInventory(Pageable pageable);

    InventoryResponse updateInventory(Long id, InventoryRequest request);

    void deleteInventory(Long id);

    boolean checkStock(String skuCode);

    InventoryResponse reserveStock(String skuCode, int quantity);

    InventoryResponse releaseStock(String skuCode, int quantity);

    Map<String, Boolean> batchCheckStock(List<String> skuCodes);

    List<InventoryResponse> getLowStockItems();

    InventoryResponse updateStockQuantity(Long id, int quantity);
}
