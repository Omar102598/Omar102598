package com.portfolio.inventory.controller;

import com.portfolio.inventory.model.dto.InventoryRequest;
import com.portfolio.inventory.model.dto.InventoryResponse;
import com.portfolio.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventory", description = "Inventory management operations")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Create inventory item", description = "Creates a new inventory record for a product SKU")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Inventory created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "409", description = "SKU already exists")
    })
    public ResponseEntity<InventoryResponse> createInventory(@Valid @RequestBody InventoryRequest request) {
        log.info("POST /api/inventory - Creating inventory for SKU: {}", request.skuCode());
        InventoryResponse response = inventoryService.createInventory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory by ID", description = "Retrieves inventory details by its unique ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Inventory found"),
            @ApiResponse(responseCode = "404", description = "Inventory not found")
    })
    public ResponseEntity<InventoryResponse> getInventoryById(
            @Parameter(description = "Inventory ID") @PathVariable Long id) {
        log.info("GET /api/inventory/{}", id);
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping
    @Operation(summary = "Get all inventory", description = "Retrieves paginated list of all inventory items")
    @ApiResponse(responseCode = "200", description = "Inventory list retrieved")
    public ResponseEntity<Page<InventoryResponse>> getAllInventory(
            @PageableDefault(size = 20, sort = "skuCode") Pageable pageable) {
        log.info("GET /api/inventory - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(inventoryService.getAllInventory(pageable));
    }

    @GetMapping("/sku/{skuCode}")
    @Operation(summary = "Get inventory by SKU code", description = "Retrieves inventory details by SKU code")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Inventory found"),
            @ApiResponse(responseCode = "404", description = "Inventory not found for SKU")
    })
    public ResponseEntity<InventoryResponse> getInventoryBySkuCode(
            @Parameter(description = "SKU code") @PathVariable String skuCode) {
        log.info("GET /api/inventory/sku/{}", skuCode);
        return ResponseEntity.ok(inventoryService.getInventoryBySkuCode(skuCode));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update inventory", description = "Updates an existing inventory item")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Inventory updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "404", description = "Inventory not found")
    })
    public ResponseEntity<InventoryResponse> updateInventory(
            @Parameter(description = "Inventory ID") @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {
        log.info("PUT /api/inventory/{}", id);
        return ResponseEntity.ok(inventoryService.updateInventory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete inventory", description = "Deletes an inventory item by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Inventory deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Inventory not found")
    })
    public ResponseEntity<Void> deleteInventory(
            @Parameter(description = "Inventory ID") @PathVariable Long id) {
        log.info("DELETE /api/inventory/{}", id);
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{skuCode}")
    @Operation(summary = "Check stock availability", description = "Checks if a product SKU has available stock")
    @ApiResponse(responseCode = "200", description = "Stock availability status")
    public ResponseEntity<Map<String, Boolean>> checkStock(
            @Parameter(description = "SKU code") @PathVariable String skuCode) {
        log.info("GET /api/inventory/check/{}", skuCode);
        boolean inStock = inventoryService.checkStock(skuCode);
        return ResponseEntity.ok(Map.of("inStock", inStock));
    }

    @PostMapping("/reserve")
    @Operation(summary = "Reserve stock", description = "Reserves a specified quantity of stock for a SKU")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stock reserved successfully"),
            @ApiResponse(responseCode = "400", description = "Insufficient stock"),
            @ApiResponse(responseCode = "404", description = "SKU not found")
    })
    public ResponseEntity<InventoryResponse> reserveStock(
            @Parameter(description = "SKU code") @RequestParam String skuCode,
            @Parameter(description = "Quantity to reserve") @RequestParam int quantity) {
        log.info("POST /api/inventory/reserve - SKU: {}, quantity: {}", skuCode, quantity);
        return ResponseEntity.ok(inventoryService.reserveStock(skuCode, quantity));
    }

    @PostMapping("/release")
    @Operation(summary = "Release reserved stock", description = "Releases previously reserved stock for a SKU")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stock released successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid release quantity"),
            @ApiResponse(responseCode = "404", description = "SKU not found")
    })
    public ResponseEntity<InventoryResponse> releaseStock(
            @Parameter(description = "SKU code") @RequestParam String skuCode,
            @Parameter(description = "Quantity to release") @RequestParam int quantity) {
        log.info("POST /api/inventory/release - SKU: {}, quantity: {}", skuCode, quantity);
        return ResponseEntity.ok(inventoryService.releaseStock(skuCode, quantity));
    }

    @PostMapping("/batch-check")
    @Operation(summary = "Batch check stock", description = "Checks stock availability for multiple SKUs at once")
    @ApiResponse(responseCode = "200", description = "Batch stock availability map")
    public ResponseEntity<Map<String, Boolean>> batchCheckStock(@RequestBody List<String> skuCodes) {
        log.info("POST /api/inventory/batch-check - {} SKUs", skuCodes.size());
        return ResponseEntity.ok(inventoryService.batchCheckStock(skuCodes));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock items", description = "Retrieves all items at or below their reorder level")
    @ApiResponse(responseCode = "200", description = "Low stock items list")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        log.info("GET /api/inventory/low-stock");
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }
}
