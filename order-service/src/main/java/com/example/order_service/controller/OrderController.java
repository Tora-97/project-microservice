package com.example.order_service.controller;

import com.example.order_service.client.ProductClient;
import com.example.order_service.dto.ApiResponse;
import com.example.order_service.dto.ProductVariantDto;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductClient productClient; 
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createOrder(@RequestBody Order order) {
        
        // Vòng lặp kiểm tra kho của từng món đồ khách muốn đặt
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                try {
                    // Gọi xuyên biên giới sang Product Service để lấy thông tin kho thật
                    ProductVariantDto variant = productClient.getVariantById(item.getProductVariantId());
                    
                    if (variant == null || variant.getStockQuantity() < item.getQuantity()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                            ApiResponse.builder()
                                    .status(HttpStatus.BAD_REQUEST.value())
                                    .message("Sản phẩm số hiệu biến thể " + item.getProductVariantId() + " đã hết hàng hoặc không đủ số lượng!")
                                    .data(null).build()
                        );
                    }
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        ApiResponse.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .message("Không thể kết nối đến Product Service để kiểm tra kho hàng.")
                                .data(null).build()
                    );
                }
            }
        }

        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<Order>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Tạo đơn hàng thành công sau khi check kho an toàn!")
                        .data(savedOrder).build()
        );
    }
}