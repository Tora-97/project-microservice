package com.example.category_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
    private int status;      // HTTP Status Code (ví dụ: 200, 201, 400, 404)
    private String message;  // Thông báo phản hồi trực quan (ví dụ: "Thành công", "Sản phẩm không tồn tại")
    private T data;          // Dữ liệu thực tế trả về (có thể là Object, List, String hoặc null)
}