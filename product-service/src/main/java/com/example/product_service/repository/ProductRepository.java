package com.example.product_service.repository;

import com.example.product_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Tạm thời để trống, kế thừa CRUD cơ bản là đủ dùng cho tuần đầu
}