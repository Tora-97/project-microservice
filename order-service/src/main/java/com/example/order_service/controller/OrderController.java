package com.example.order_service.controller;

import com.example.order_service.client.ProductClient;
import com.example.order_service.client.DiscountClient;
import com.example.order_service.dto.ApiResponse;
import com.example.order_service.dto.ProductVariantDto;
import com.example.order_service.entity.Order;
import com.example.order_service.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.order_service.dto.ProductDto;
import com.example.order_service.entity.OrderItem;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private DiscountClient discountClient;

    @PostMapping
    @CircuitBreaker(name = "productServiceCB", fallbackMethod = "fallbackCreateOrder")
    public ResponseEntity<ApiResponse<?>> createOrder(@RequestBody Order order) {
        // Gọi chéo sang Product Service check kho
        if (order.getItems() != null) {
            // First pass: verify all stock
            order.getItems().forEach(item -> {
                ProductVariantDto variant = productClient.getVariantById(item.getProductVariantId());
                if (variant == null || variant.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Kho không đủ hàng!");
                }
            });
            // Second pass: actually deduct
            order.getItems().forEach(item -> {
                productClient.deductVariantStock(item.getProductVariantId(), item.getQuantity());
            });

            // Third pass: Populate price and calculate totalPrice
            double totalPrice = 0.0;
            for (OrderItem item : order.getItems()) {
                try {
                    ApiResponse<ProductDto> productRes = productClient.getProductById(item.getProductId());
                    if (productRes != null && productRes.getData() != null) {
                        Double basePrice = productRes.getData().getBasePrice();
                        double price = basePrice != null ? basePrice : 0.0;
                        item.setPrice(price);
                        totalPrice += price * item.getQuantity();
                    } else {
                        item.setPrice(0.0);
                    }
                } catch (Exception e) {
                    // Fallback to 0 if product service is offline or not reachable
                    item.setPrice(0.0);
                }
            }

            // Fourth pass: Handle Discount Voucher
            if (order.getDiscountCode() != null && !order.getDiscountCode().trim().isEmpty()) {
                try {
                    ApiResponse<Map<String, Object>> validateRes = discountClient.validateDiscount(order.getDiscountCode(), totalPrice);
                    if (validateRes != null && validateRes.getData() != null) {
                        Map<String, Object> discountData = validateRes.getData();
                        Boolean isValid = (Boolean) discountData.get("valid");
                        if (Boolean.TRUE.equals(isValid)) {
                            Double discountAmount = ((Number) discountData.get("discountAmount")).doubleValue();
                            order.setDiscountAmount(discountAmount);
                            totalPrice = totalPrice - discountAmount;
                            if (totalPrice < 0) {
                                totalPrice = 0.0;
                            }
                            // Ghi nhận đã sử dụng voucher thành công
                            discountClient.useDiscount(order.getDiscountCode());
                        } else {
                            throw new RuntimeException((String) discountData.get("message"));
                        }
                    } else {
                        throw new RuntimeException("Không thể xác minh mã giảm giá.");
                    }
                } catch (Exception e) {
                    if (e instanceof RuntimeException) {
                        throw e;
                    }
                    throw new RuntimeException("Lỗi kết nối dịch vụ giảm giá: " + e.getMessage());
                }
            } else {
                order.setDiscountAmount(0.0);
            }

            order.setTotalPrice(totalPrice);
        } else {
            order.setTotalPrice(0.0);
            order.setDiscountAmount(0.0);
        }
        order.setStatus("PENDING");
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.builder().status(201).message("Đặt hàng thành công!").data(orderRepository.save(order)).build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<Order>>> getAllOrders() {
        return ResponseEntity.ok(
            ApiResponse.<java.util.List<Order>>builder()
                .status(200)
                .message("Lấy danh sách đơn hàng thành công")
                .data(orderRepository.findAll())
                .build()
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<java.util.List<Order>>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(
            ApiResponse.<java.util.List<Order>>builder()
                .status(200)
                .message("Lấy danh sách đơn hàng thành công")
                .data(orderRepository.findByUserId(userId))
                .build()
        );
    }


    public ResponseEntity<ApiResponse<?>> fallbackCreateOrder(Order order, Throwable t) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
            ApiResponse.builder()
                    .status(503)
                    .message("Hệ thống kiểm tra kho hàng hiện tại đang bận hoặc gặp sự cố sập nguồn. Đơn hàng của bạn tạm thời ghi nhận xử lý sau!")
                    .data(null).build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(@PathVariable Long id, @RequestBody Order orderUpdate) {
        return orderRepository.findById(id).map(existing -> {
            if (orderUpdate.getStatus() != null) {
                existing.setStatus(orderUpdate.getStatus());
            }
            Order saved = orderRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.<Order>builder()
                .status(200)
                .message("Cập nhật trạng thái đơn hàng thành công")
                .data(saved)
                .build()
            );
        }).orElseGet(() -> ResponseEntity.status(404).body(
            ApiResponse.<Order>builder()
                .status(404)
                .message("Không tìm thấy đơn hàng")
                .build()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        return orderRepository.findById(id).map(existing -> {
            orderRepository.delete(existing);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xoá đơn hàng thành công")
                .build()
            );
        }).orElseGet(() -> ResponseEntity.status(404).body(
            ApiResponse.<Void>builder()
                .status(404)
                .message("Không tìm thấy đơn hàng")
                .build()
        ));
    }
}