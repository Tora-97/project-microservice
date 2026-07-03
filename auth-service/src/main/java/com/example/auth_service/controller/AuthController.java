package com.example.auth_service.controller;

import com.example.auth_service.dto.ApiResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest request) {
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        
        // Log ra terminal để kiểm tra chuỗi mật khẩu băm trông như thế nào
        System.out.println("Mật khẩu băm BCrypt sẽ lưu xuống DB: " + hashedPassword); 

        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.OK.value())
                .message("Đăng ký tài khoản thành công!")
                .data("User_ID_Cục_Bộ")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody LoginRequest request) {
        // Giả lập kiểm tra logic tài khoản chuẩn (admin@gmail.com / mật khẩu: 123)
        if ("admin@gmail.com".equals(request.getEmail()) && "123".equals(request.getPassword())) {
            String token = jwtService.generateToken(request.getEmail());
            
            Map<String, String> loginData = Map.of(
                "token", token,
                "role", "ADMIN",
                "email", request.getEmail()
            );

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Đăng nhập thành công với JWT thật")
                    .data(loginData).build());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.<Map<String, String>>builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Tài khoản hoặc mật khẩu không chính xác!")
                .data(null).build());
    }
}