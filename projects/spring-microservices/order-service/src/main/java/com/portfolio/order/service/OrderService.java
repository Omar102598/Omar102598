package com.portfolio.order.service;

import com.portfolio.order.model.Order;
import com.portfolio.order.model.dto.OrderRequest;
import com.portfolio.order.model.dto.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getOrdersByUserId(UUID userId);

    Page<OrderResponse> getAllOrders(Pageable pageable);

    OrderResponse updateOrderStatus(Long id, Order.OrderStatus status);

    OrderResponse cancelOrder(Long id);

    OrderResponse getOrderByOrderNumber(String orderNumber);

    List<String> getOrderRecommendations(UUID userId);
}
