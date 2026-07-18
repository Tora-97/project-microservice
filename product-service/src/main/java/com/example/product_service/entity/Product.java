package com.example.product_service.entity; // Nhớ check lại chuẩn package của bạn

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

import org.hibernate.annotations.Nationalized;

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
    
    @Nationalized
    @Column(nullable = false, length = 255)
    private String name;
    
    @Nationalized
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private Double basePrice;

    @Column(length = 500)
    private String imageUrl;

    // Quan hệ 1-N: Một sản phẩm có nhiều biến thể size/màu.
    // CascadeType.ALL để khi lưu Product, các Variant tự động được lưu theo.
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<ProductVariant> variants;

    @Column(name = "category_id")
    private Long categoryId;
}