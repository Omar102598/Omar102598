package com.portfolio.inventory.repository;

import com.portfolio.inventory.model.Inventory;
import com.portfolio.inventory.model.Inventory.InventoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findBySkuCode(String skuCode);

    List<Inventory> findBySkuCodeIn(List<String> skuCodes);

    Page<Inventory> findByStatus(InventoryStatus status, Pageable pageable);

    List<Inventory> findByWarehouse(String warehouse);

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.reorderLevel AND i.status <> 'DISCONTINUED'")
    List<Inventory> findLowStockItems();

    boolean existsBySkuCode(String skuCode);

    List<Inventory> findByQuantityLessThan(Integer quantity);
}
