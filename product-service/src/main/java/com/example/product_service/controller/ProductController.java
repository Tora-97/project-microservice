package com.example.product_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import com.example.product_service.dto.ApiResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.entity.ProductVariant;
import com.example.product_service.repository.ProductRepository;
import com.example.product_service.repository.ProductVariantRepository;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    // 1. API Lấy danh sách toàn bộ sản phẩm quần áo hoặc tìm kiếm
    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId) {
        
        List<Product> products;
        if (query != null && !query.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAll();
        }
        
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

    // 3.1 API Cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable Long id, @RequestBody Product productUpdate) {
        return productRepository.findById(id).map(existing -> {
            if (productUpdate.getName() != null) existing.setName(productUpdate.getName());
            if (productUpdate.getDescription() != null) existing.setDescription(productUpdate.getDescription());
            if (productUpdate.getBasePrice() != null) existing.setBasePrice(productUpdate.getBasePrice());
            if (productUpdate.getImageUrl() != null) existing.setImageUrl(productUpdate.getImageUrl());
            if (productUpdate.getCategoryId() != null) existing.setCategoryId(productUpdate.getCategoryId());

            if (productUpdate.getVariants() != null) {
                // Clear old and add new to utilize orphanRemoval
                existing.getVariants().clear();
                productUpdate.getVariants().forEach(v -> {
                    v.setProduct(existing);
                    existing.getVariants().add(v);
                });
            }

            Product savedProduct = productRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.<Product>builder()
                    .status(HttpStatus.OK.value())
                    .message("Cập nhật sản phẩm thành công")
                    .data(savedProduct)
                    .build());
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.<Product>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy sản phẩm")
                        .build()
        ));
    }

    // 3.2 API Xoá sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id).map(existing -> {
            productRepository.delete(existing);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .status(HttpStatus.OK.value())
                    .message("Xoá sản phẩm thành công")
                    .build());
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy sản phẩm")
                        .build()
        ));
    }

    // 3.3 API Trừ kho variant
    @PutMapping("/variants/{variantId}/deduct")
    public ResponseEntity<ApiResponse<String>> deductVariantStock(
            @PathVariable Long variantId, 
            @RequestParam int quantity) {
        return productVariantRepository.findById(variantId).map(variant -> {
            if (variant.getStockQuantity() < quantity) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.<String>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message("Không đủ số lượng trong kho")
                            .build()
                );
            }
            variant.setStockQuantity(variant.getStockQuantity() - quantity);
            productVariantRepository.save(variant);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("Trừ kho thành công")
                    .data("Remaining stock: " + variant.getStockQuantity())
                    .build());
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.<String>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy variant")
                        .build()
        ));
    }

    // 4. API Upload ảnh
    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.<String>builder().status(400).message("File is empty").build()
            );
        }

        try {
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName != null && originalFileName.contains(".") 
                    ? originalFileName.substring(originalFileName.lastIndexOf(".")) 
                    : "";
            String newFileName = UUID.randomUUID().toString() + extension;
            
            Path uploadPath = Paths.get("/app/uploads/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), filePath);
            
            String fileUrl = "http://localhost:8080/uploads/" + newFileName; // We use gateway URL

            return ResponseEntity.ok(
                ApiResponse.<String>builder().status(200).message("Upload success").data(fileUrl).build()
            );
        } catch (IOException e) {
            return ResponseEntity.status(500).body(
                ApiResponse.<String>builder().status(500).message("Could not upload file: " + e.getMessage()).build()
            );
        }
    }


    // 5. API Lấy thông tin Variant
    @GetMapping("/variants/{variantId}")
    public ProductVariant getVariantById(@PathVariable Long variantId) {
        // For simplicity in this demo, just search across all products.
        // A dedicated VariantRepository would be better, but this works for now.
        for (Product product : productRepository.findAll()) {
            if (product.getVariants() != null) {
                for (ProductVariant variant : product.getVariants()) {
                    if (variant.getId().equals(variantId)) {
                        return variant;
                    }
                }
            }
        }
        return null;
    }
}