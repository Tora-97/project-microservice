package com.example.order_service.client;

import com.example.order_service.dto.ApiResponse;
import com.example.order_service.dto.ProductDto;
import com.example.order_service.dto.ProductVariantDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Khai báo kết nối trực tiếp đến endpoint của Product Service
@FeignClient(name = "product-service", url = "http://product-service:8082")
public interface ProductClient {

    @GetMapping("/api/v1/products/variants/{variantId}")
    ProductVariantDto getVariantById(@PathVariable("variantId") Long variantId);

    @GetMapping("/api/v1/products/{id}")
    ApiResponse<ProductDto> getProductById(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.PutMapping("/api/v1/products/variants/{variantId}/deduct")
    void deductVariantStock(@PathVariable("variantId") Long variantId, @org.springframework.web.bind.annotation.RequestParam("quantity") int quantity);
}