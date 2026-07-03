package com.example.product_service.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String size;  // Ví dụ: S, M, L, XL, XXL
    
    @Column(nullable = false, length = 50)
    private String color; // Ví dụ: Đen, Trắng, Xanh Navy
    
    @Column(nullable = false)
    private Integer stockQuantity; // Số lượng tồn kho

    // Quan hệ N-1 hướng ngược lại về Product
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore // Tránh bị vòng lặp vô hạn (Infinite Loop) khi biến đổi sang JSON
    @ToString.Exclude // Tránh lỗi loop lặp vô hạn của Lombok ToString
    private Product product;
}