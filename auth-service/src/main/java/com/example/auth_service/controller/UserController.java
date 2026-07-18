package com.example.auth_service.controller;

import com.example.auth_service.dto.ApiResponse;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(
            ApiResponse.<List<User>>builder()
                .status(200)
                .message("Success")
                .data(userRepository.findAll())
                .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id, @RequestBody User userUpdate) {
        return userRepository.findById(id).map(user -> {
            if (userUpdate.getEmail() != null) user.setEmail(userUpdate.getEmail());
            if (userUpdate.getRole() != null) user.setRole(userUpdate.getRole());
            if (userUpdate.getFullName() != null) user.setFullName(userUpdate.getFullName());
            if (userUpdate.getPhone() != null) user.setPhone(userUpdate.getPhone());
            if (userUpdate.getAddress() != null) user.setAddress(userUpdate.getAddress());
            User saved = userRepository.save(user);
            return ResponseEntity.ok(
                ApiResponse.<User>builder()
                    .status(200)
                    .message("User updated successfully")
                    .data(saved)
                    .build()
            );
        }).orElseGet(() -> ResponseEntity.status(404).body(
                ApiResponse.<User>builder()
                    .status(404)
                    .message("User not found")
                    .build()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                    .status(200)
                    .message("User deleted successfully")
                    .build()
            );
        }).orElseGet(() -> ResponseEntity.status(404).body(
                ApiResponse.<Void>builder()
                    .status(404)
                    .message("User not found")
                    .build()
        ));
    }
}
