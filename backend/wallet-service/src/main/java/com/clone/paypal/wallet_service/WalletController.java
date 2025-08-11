package com.clone.paypal.wallet_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Wallet> getWalletByUserId(@PathVariable Long userId) {
        return walletRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Wallet> createWallet(@RequestBody Wallet wallet) {
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setCurrency("INR");
        Wallet savedWallet = walletRepository.save(wallet);
        return ResponseEntity.ok(savedWallet);
    }

    @PostMapping("/debit")
    public ResponseEntity<Void> debit(@RequestBody WalletTransactionRequest request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId()).orElse(null);
        if (wallet == null || wallet.getBalance().compareTo(request.getAmount()) < 0) {
            return ResponseEntity.badRequest().build();
        }
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/credit")
    public ResponseEntity<Void> credit(@RequestBody WalletTransactionRequest request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId()).orElse(null);
        if (wallet == null) {
            return ResponseEntity.badRequest().build();
        }
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        // Send notification
        String message = String.format("You added %.2f to your wallet.", request.getAmount().doubleValue());
        kafkaProducerService.sendNotificationEvent(new NotificationRequest(request.getUserId(), message));

        return ResponseEntity.ok().build();
    }
}