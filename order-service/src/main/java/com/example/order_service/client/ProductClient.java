package com.example.order_service.client;

import com.example.order_service.dto.ProductVariantDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Khai báo kết nối trực tiếp đến endpoint của Product Service
@FeignClient(name = "product-service", url = "http://localhost:8082")
public interface ProductClient {

    @GetMapping("/api/v1/products/variants/{variantId}")
    ProductVariantDto getVariantById(@PathVariable("variantId") Long variantId);
}