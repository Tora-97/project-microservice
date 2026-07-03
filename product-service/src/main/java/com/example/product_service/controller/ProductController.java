package com.example.product_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.product_service.dto.ApiResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.repository.ProductRepository;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // 1. API Lấy danh sách toàn bộ sản phẩm quần áo
    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        
        ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách sản phẩm thành công")
                .data(products)
                .build();
                
        return ResponseEntity.ok(response);
    }

    // 2. API Xem chi tiết 1 sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(
                        ApiResponse.<Product>builder()
                                .status(HttpStatus.OK.value())
                                .message("Tìm thấy sản phẩm")
                                .data(product)
                                .build()
                ))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiResponse.<Product>builder()
                                .status(HttpStatus.NOT_FOUND.value())
                                .message("Không tìm thấy sản phẩm với ID: " + id)
                                .data(null)
                                .build()
                ));
    }

    // 3. API Thêm mới sản phẩm quần áo (Kèm theo danh sách các Size/Màu)
    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        // Rất quan trọng: Duyệt qua các variant để gán ngược product cha vào nhằm tránh lỗi khóa ngoại (NULL)
        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> variant.setProduct(product));
        }
        
        Product savedProduct = productRepository.save(product);
        
        ApiResponse<Product> response = ApiResponse.<Product>builder()
                .status(HttpStatus.CREATED.value())
                .message("Thêm sản phẩm mới thành công")
                .data(savedProduct)
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}