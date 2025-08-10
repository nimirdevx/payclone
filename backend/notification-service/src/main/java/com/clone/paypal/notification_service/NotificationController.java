package com.clone.paypal.notification_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/user")
    public ResponseEntity<?> getNotificationsByUserId(@RequestParam Long id) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderByTimestampDesc(id);
            return ResponseEntity.ok(Map.of("notifications", notifications));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch notifications"));
        }
    }
}