package com.example.order_service.dto;

import lombok.Data;

@Data
public class ProductVariantDto {
    private Long id;
    private String size;
    private String color;
    private Integer stockQuantity;
}