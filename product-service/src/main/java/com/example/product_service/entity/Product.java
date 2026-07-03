package com.example.product_service.entity; // Nhớ check lại chuẩn package của bạn

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private Double basePrice;

    // Quan hệ 1-N: Một sản phẩm có nhiều biến thể size/màu.
    // CascadeType.ALL để khi lưu Product, các Variant tự động được lưu theo.
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductVariant> variants;
}