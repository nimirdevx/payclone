package com.clone.paypal.transaction_service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    @Autowired private TransactionService transactionService;
    @Autowired private TransactionRepository transactionRepository;

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody TransactionRequest request) {
        Transaction newTransaction = transactionService.performTransaction(
                request.getSenderId(), request.getRecipientEmail(), request.getAmount()
        );
        return ResponseEntity.ok(newTransaction);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUserId(@PathVariable Long userId) {
        List<Transaction> transactions = transactionRepository.findBySenderIdOrRecipientId(userId, userId);
        return ResponseEntity.ok(transactions);
    }
}