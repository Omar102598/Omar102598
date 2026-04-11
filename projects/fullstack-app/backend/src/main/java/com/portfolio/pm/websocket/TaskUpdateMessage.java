package com.portfolio.pm.websocket;

import java.util.UUID;

public record TaskUpdateMessage(
        UUID taskId,
        UUID projectId,
        String status,
        String updatedBy
) {}
