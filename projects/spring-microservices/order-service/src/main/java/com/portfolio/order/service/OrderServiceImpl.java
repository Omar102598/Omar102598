package com.portfolio.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.order.client.AiClient;
import com.portfolio.order.client.UserClient;
import com.portfolio.order.event.OrderCreatedEvent;
import com.portfolio.order.exception.OrderNotFoundException;
import com.portfolio.order.model.Order;
import com.portfolio.order.model.Order.OrderStatus;
import com.portfolio.order.model.dto.OrderRequest;
import com.portfolio.order.model.dto.OrderResponse;
import com.portfolio.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final String ORDER_EVENTS_TOPIC = "order-events";

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class)
    );

    private final OrderRepository orderRepository;
    private final UserClient userClient;
    private final AiClient aiClient;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating order for user: {}", request.userId());

        // Validate user exists via Feign client
        var user = userClient.getUserById(request.userId());
        if (user == null || user.id() == null) {
            throw new IllegalStateException("User not found with id: " + request.userId());
        }

        // Calculate total amount from items
        BigDecimal totalAmount = request.items().stream()
                .map(item -> item.unitPrice().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Serialize items to JSON
        String itemsJson = serializeItems(request.items());

        Order order = Order.builder()
                .userId(request.userId())
                .items(itemsJson)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.shippingAddress())
                .notes(request.notes())
                .build();

        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with number: {}", savedOrder.getOrderNumber());

        // Publish Kafka event
        publishOrderCreatedEvent(savedOrder);

        return OrderResponse.from(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        log.debug("Fetching order by id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return OrderResponse.from(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(UUID userId) {
        log.debug("Fetching orders for user: {}", userId);
        return orderRepository.findByUserId(userId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        log.debug("Fetching all orders, page: {}", pageable.getPageNumber());
        return orderRepository.findAll(pageable)
                .map(OrderResponse::from);
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        log.info("Updating order {} status to {}", id, newStatus);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}", id, newStatus);

        return OrderResponse.from(updatedOrder);
    }

    @Override
    public OrderResponse cancelOrder(Long id) {
        log.info("Cancelling order: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        validateStatusTransition(order.getStatus(), OrderStatus.CANCELLED);

        order.setStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        log.info("Order {} cancelled successfully", id);

        return OrderResponse.from(cancelledOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        log.debug("Fetching order by order number: {}", orderNumber);
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        return OrderResponse.from(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getOrderRecommendations(UUID userId) {
        log.info("Fetching recommendations for user: {}", userId);

        List<Order> userOrders = orderRepository.findByUserId(userId);
        List<String> orderHistory = userOrders.stream()
                .map(Order::getItems)
                .toList();

        AiClient.RecommendationRequest request = new AiClient.RecommendationRequest(
                userId, orderHistory
        );

        AiClient.RecommendationResponse response = aiClient.getRecommendations(request);
        return response.recommendations();
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        Set<OrderStatus> allowedTransitions = VALID_TRANSITIONS.getOrDefault(
                currentStatus, EnumSet.noneOf(OrderStatus.class)
        );

        if (!allowedTransitions.contains(newStatus)) {
            throw new IllegalStateException(
                    String.format("Invalid status transition from %s to %s. Allowed transitions: %s",
                            currentStatus, newStatus, allowedTransitions)
            );
        }
    }

    private String serializeItems(List<OrderRequest.OrderItemDto> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize order items", e);
            throw new IllegalStateException("Failed to serialize order items", e);
        }
    }

    private void publishOrderCreatedEvent(Order order) {
        try {
            OrderCreatedEvent event = new OrderCreatedEvent(
                    order.getOrderNumber(),
                    order.getUserId(),
                    order.getTotalAmount(),
                    order.getShippingAddress(),
                    LocalDateTime.now()
            );
            String eventJson = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_EVENTS_TOPIC, order.getOrderNumber(), eventJson);
            log.info("Published OrderCreatedEvent for order: {}", order.getOrderNumber());
        } catch (JsonProcessingException e) {
            log.error("Failed to publish order event for order: {}", order.getOrderNumber(), e);
        }
    }
}
