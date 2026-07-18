package com.example.discount_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ví dụ: WELCOME10, MEGA50

    @Column(nullable = false, length = 20)
    private String discountType; // "PERCENT" hoặc "FIXED"

    @Column(nullable = false)
    private Double discountValue; // Giá trị giảm (Ví dụ: 10% hoặc 50.000đ)

    @Column(nullable = false)
    private Double minOrderValue; // Đơn hàng tối thiểu để áp dụng

    @Column(nullable = false)
    private Double maxDiscountValue; // Giới hạn giảm tối đa (Áp dụng cho PERCENT)

    @Column(nullable = false)
    private Integer usageLimit; // Số lần sử dụng tối đa của mã

    @Column(nullable = false)
    private Integer usedCount; // Số lần mã đã được sử dụng
}
