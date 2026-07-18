package com.example.discount_service.controller;

import com.example.discount_service.dto.ApiResponse;
import com.example.discount_service.entity.Discount;
import com.example.discount_service.repository.DiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/discounts")
public class DiscountController {

    @Autowired
    private DiscountRepository discountRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Discount>>> getAllDiscounts() {
        return ResponseEntity.ok(
            ApiResponse.<List<Discount>>builder()
                .status(200)
                .message("Lấy danh sách mã giảm giá thành công")
                .data(discountRepository.findAll())
                .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Discount>> createDiscount(@RequestBody Discount discount) {
        if (discount.getUsedCount() == null) {
            discount.setUsedCount(0);
        }
        Discount saved = discountRepository.save(discount);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.<Discount>builder()
                .status(201)
                .message("Tạo mã giảm giá thành công")
                .data(saved)
                .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDiscount(@PathVariable Long id) {
        return discountRepository.findById(id).map(existing -> {
            discountRepository.delete(existing);
            return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                    .status(200)
                    .message("Xoá mã giảm giá thành công")
                    .build()
            );
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ApiResponse.<Void>builder()
                .status(404)
                .message("Không tìm thấy mã giảm giá")
                .build()
        ));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateDiscount(
            @RequestParam String code,
            @RequestParam Double orderAmount) {
        
        Map<String, Object> result = new HashMap<>();
        
        return discountRepository.findByCode(code).map(discount -> {
            // 1. Kiểm tra giới hạn lượt dùng
            if (discount.getUsedCount() >= discount.getUsageLimit()) {
                result.put("valid", false);
                result.put("discountAmount", 0.0);
                result.put("message", "Mã giảm giá đã hết lượt sử dụng!");
                return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .status(200).message("Mã không hợp lệ").data(result).build());
            }

            // 2. Kiểm tra giá trị đơn hàng tối thiểu
            if (orderAmount < discount.getMinOrderValue()) {
                result.put("valid", false);
                result.put("discountAmount", 0.0);
                result.put("message", "Đơn hàng tối thiểu phải đạt từ $" + String.format("%.2f", discount.getMinOrderValue()) + " để sử dụng mã này.");
                return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .status(200).message("Đơn hàng chưa đạt giá trị tối thiểu").data(result).build());
            }

            // 3. Tính toán giá trị giảm giá
            double discountAmount = 0.0;
            if ("PERCENT".equalsIgnoreCase(discount.getDiscountType())) {
                discountAmount = orderAmount * (discount.getDiscountValue() / 100.0);
                if (discount.getMaxDiscountValue() > 0 && discountAmount > discount.getMaxDiscountValue()) {
                    discountAmount = discount.getMaxDiscountValue();
                }
            } else if ("FIXED".equalsIgnoreCase(discount.getDiscountType())) {
                discountAmount = discount.getDiscountValue();
            }

            // Giới hạn giảm tối đa bằng giá trị đơn hàng
            if (discountAmount > orderAmount) {
                discountAmount = orderAmount;
            }

            result.put("valid", true);
            result.put("discountAmount", discountAmount);
            result.put("message", "Áp dụng mã giảm giá thành công!");
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .status(200).message("Mã hợp lệ").data(result).build());

        }).orElseGet(() -> {
            result.put("valid", false);
            result.put("discountAmount", 0.0);
            result.put("message", "Mã giảm giá không tồn tại!");
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .status(200).message("Mã không tồn tại").data(result).build());
        });
    }

    // API tăng lượt dùng khi đơn đặt thành công (gọi từ order-service)
    @PutMapping("/use")
    public ResponseEntity<ApiResponse<Void>> useDiscount(@RequestParam String code) {
        return discountRepository.findByCode(code).map(discount -> {
            discount.setUsedCount(discount.getUsedCount() + 1);
            discountRepository.save(discount);
            return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                    .status(200)
                    .message("Sử dụng mã giảm giá thành công")
                    .build()
            );
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ApiResponse.<Void>builder()
                .status(404)
                .message("Không tìm thấy mã giảm giá")
                .build()
        ));
    }
}
