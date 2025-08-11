package com.clone.paypal.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Inject the password encoder

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // New Login DTO (Data Transfer Object)
    public static class LoginRequest {
        public String email;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.password, user.getPassword())) {
                // For now, return a simple placeholder token. In a real app, this would be a securely generated JWT.
                return ResponseEntity.ok(new LoginResponse("dummy-jwt-token-for-" + user.getId(), user.getId(), user.getFullName()));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

        @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getAuthenticatedUser(@RequestHeader("Authorization") String authorizationHeader) {
        // In a real application, you would validate the JWT and extract user information.
        // For this example, we're extracting the user ID from our dummy token.
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer dummy-jwt-token-for-")) {
            try {
                Long userId = Long.parseLong(authorizationHeader.substring("Bearer dummy-jwt-token-for-".length()));
                Optional<User> userOptional = userRepository.findById(userId);
                return userOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String q) {
        List<User> users = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, q);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/analytics/{id}")
    public ResponseEntity<?> getUserAnalytics(@PathVariable Long id) {
        try {
            // Fetch transactions from transaction service
            String transactionServiceUrl = "http://transaction-service:8083/api/transactions/user/" + id;
            ResponseEntity<Map> transactionResponse = restTemplate.getForEntity(transactionServiceUrl, Map.class);
            
            // Fetch wallet info from wallet service
            String walletServiceUrl = "http://wallet-service:8082/api/wallets/user/" + id;
            ResponseEntity<Map> walletResponse = restTemplate.getForEntity(walletServiceUrl, Map.class);
            
            // Create analytics response
            Map<String, Object> analytics = Map.of(
                "transactions", transactionResponse.getBody() != null ? transactionResponse.getBody() : Map.of(),
                "wallet", walletResponse.getBody() != null ? walletResponse.getBody() : Map.of(),
                "summary", Map.of(
                    "totalTransactions", 0, // This would be calculated from actual data
                    "totalSpent", 0,
                    "totalReceived", 0
                )
            );
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch user analytics"));
        }
    }
}