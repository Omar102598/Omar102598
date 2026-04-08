package com.portfolio.notification.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderEventListener {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void handleOrderEvent(String message) {
        log.info("Received order event: {}", message);

        try {
            JsonNode event = objectMapper.readTree(message);
            String orderId = event.path("orderId").asText();
            String status = event.path("status").asText();
            String customerEmail = event.path("customerEmail").asText();
            String customerPhone = event.path("customerPhone").asText();

            switch (status.toUpperCase()) {
                case "CREATED" -> {
                    String subject = "Order Confirmation - " + orderId;
                    String body = buildOrderCreatedEmail(orderId, event);
                    notificationService.sendEmailNotification(customerEmail, subject, body);
                }
                case "SHIPPED" -> {
                    String subject = "Order Shipped - " + orderId;
                    String body = buildOrderShippedEmail(orderId, event);
                    notificationService.sendEmailNotification(customerEmail, subject, body);
                    notificationService.sendSmsNotification(customerPhone,
                            "Your order " + orderId + " has been shipped!");
                }
                case "DELIVERED" -> {
                    String subject = "Order Delivered - " + orderId;
                    String body = buildOrderDeliveredEmail(orderId);
                    notificationService.sendEmailNotification(customerEmail, subject, body);
                }
                case "CANCELLED" -> {
                    String subject = "Order Cancelled - " + orderId;
                    String body = buildOrderCancelledEmail(orderId);
                    notificationService.sendEmailNotification(customerEmail, subject, body);
                }
                default -> log.warn("Unknown order status: {} for order: {}", status, orderId);
            }

        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage(), e);
        }
    }

    private String buildOrderCreatedEmail(String orderId, JsonNode event) {
        double total = event.path("totalAmount").asDouble(0.0);
        return "<h2>Order Confirmed</h2>"
                + "<p>Your order <strong>" + orderId + "</strong> has been placed successfully.</p>"
                + "<p>Total: $" + String.format("%.2f", total) + "</p>"
                + "<p>We will notify you when your order ships.</p>";
    }

    private String buildOrderShippedEmail(String orderId, JsonNode event) {
        String trackingNumber = event.path("trackingNumber").asText("N/A");
        return "<h2>Order Shipped</h2>"
                + "<p>Your order <strong>" + orderId + "</strong> has been shipped.</p>"
                + "<p>Tracking Number: " + trackingNumber + "</p>";
    }

    private String buildOrderDeliveredEmail(String orderId) {
        return "<h2>Order Delivered</h2>"
                + "<p>Your order <strong>" + orderId + "</strong> has been delivered.</p>"
                + "<p>Thank you for your purchase!</p>";
    }

    private String buildOrderCancelledEmail(String orderId) {
        return "<h2>Order Cancelled</h2>"
                + "<p>Your order <strong>" + orderId + "</strong> has been cancelled.</p>"
                + "<p>If you did not request this cancellation, please contact support.</p>";
    }
}
