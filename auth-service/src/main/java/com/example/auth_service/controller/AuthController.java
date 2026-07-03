package com.example.auth_service.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.dto.ApiResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    // 1. API Đăng ký tài khoản (Mock thông báo thành công)
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest request) {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.OK.value())
                .message("Đăng ký tài khoản cho " + request.getEmail() + " thành công!")
                .data("User_ID_Mock_12345")
                .build();
        return ResponseEntity.ok(response);
    }

    // 2. API Đăng nhập (Mock kiểm tra đúng pass -> trả về token giả)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody LoginRequest request) {
        // Giả lập kiểm tra tài khoản
        if ("admin@gmail.com".equals(request.getEmail()) && "123".equals(request.getPassword())) {
            
            Map<String, String> loginData = Map.of(
                "token", "mocked-jwt-token-xyz-for-clothe-shop-project",
                "role", "ADMIN",
                "email", request.getEmail()
            );

            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Đăng nhập thành công")
                    .data(loginData)
                    .build();
            return ResponseEntity.ok(response);
        }

        // Trường hợp sai tài khoản/mật khẩu
        ApiResponse<Map<String, String>> errorResponse = ApiResponse.<Map<String, String>>builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Email hoặc mật khẩu không chính xác!")
                .data(null)
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }
}