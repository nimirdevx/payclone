package com.clone.paypal.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
public class MoneyRequestController {

    @Autowired
    private MoneyRequestRepository moneyRequestRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    // DTO for creating money requests
    public static class CreateMoneyRequestDto {
        public Long requesterId;
        public Long recipientId;
        public BigDecimal amount;
        public String message;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createMoneyRequest(@RequestBody CreateMoneyRequestDto requestDto) {
        try {
            MoneyRequest moneyRequest = new MoneyRequest(
                    requestDto.requesterId,
                    requestDto.recipientId,
                    requestDto.amount,
                    requestDto.message,
                    "pending",
                    LocalDateTime.now(ZoneId.of("Asia/Kolkata"))
            );

            MoneyRequest savedRequest = moneyRequestRepository.save(moneyRequest);

            // Send notification
            String message = String.format("You have a new money request for %.2f.", requestDto.amount);
            kafkaProducerService.sendNotificationEvent(new NotificationRequest(requestDto.recipientId, message, "Money Request"));

            return ResponseEntity.ok(Map.of("message", "Money request created successfully", "request", savedRequest));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create money request"));
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserRequests(@PathVariable Long id) {
        try {
            List<MoneyRequest> requests = moneyRequestRepository.findByRequesterIdOrRecipientIdOrderByTimestampDesc(id, id);
            return ResponseEntity.ok(Map.of("requests", requests));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch user requests"));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        try {
            Optional<MoneyRequest> requestOptional = moneyRequestRepository.findById(id);
            if (requestOptional.isPresent()) {
                MoneyRequest request = requestOptional.get();
                if ("pending".equals(request.getStatus())) {
                    request.setStatus("approved");
                    moneyRequestRepository.save(request);

                    // Notify requester
                    String requesterMessage = String.format("Your money request for %.2f was approved.", request.getAmount());
                    kafkaProducerService.sendNotificationEvent(new NotificationRequest(request.getRequesterId(), requesterMessage, "Money Request"));
                    
                    return ResponseEntity.ok(Map.of("message", "Money request approved successfully"));
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Request is not in pending status"));
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to approve request"));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        try {
            Optional<MoneyRequest> requestOptional = moneyRequestRepository.findById(id);
            if (requestOptional.isPresent()) {
                MoneyRequest request = requestOptional.get();
                if ("pending".equals(request.getStatus())) {
                    request.setStatus("rejected");
                    moneyRequestRepository.save(request);

                    // Notify requester
                    String requesterMessage = String.format("Your money request for %.2f was rejected.", request.getAmount());
                    kafkaProducerService.sendNotificationEvent(new NotificationRequest(request.getRequesterId(), requesterMessage, "Money Request"));

                    return ResponseEntity.ok(Map.of("message", "Money request rejected successfully"));
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Request is not in pending status"));
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to reject request"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id) {
        try {
            Optional<MoneyRequest> requestOptional = moneyRequestRepository.findById(id);
            if (requestOptional.isPresent()) {
                MoneyRequest request = requestOptional.get();
                if ("pending".equals(request.getStatus())) {
                    moneyRequestRepository.delete(request);

                    // Notify recipient
                    String recipientMessage = String.format("A money request for %.2f was canceled.", request.getAmount());
                    kafkaProducerService.sendNotificationEvent(new NotificationRequest(request.getRecipientId(), recipientMessage, "Money Request"));

                    return ResponseEntity.ok(Map.of("message", "Money request cancelled successfully"));
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Only pending requests can be cancelled"));
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to cancel request"));
        }
    }
}