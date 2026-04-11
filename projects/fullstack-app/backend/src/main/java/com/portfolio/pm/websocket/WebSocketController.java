package com.portfolio.pm.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/task.update")
    public void handleTaskUpdate(TaskUpdateMessage message) {
        log.debug("Received WebSocket task update for project: {}, task: {}",
                message.projectId(), message.taskId());
        messagingTemplate.convertAndSend("/topic/tasks/" + message.projectId(), message);
    }
}
