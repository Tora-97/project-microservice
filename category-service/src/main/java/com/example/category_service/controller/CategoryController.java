package com.example.category_service.controller;

import com.example.category_service.dto.ApiResponse;
import com.example.category_service.entity.Category;
import com.example.category_service.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        return ResponseEntity.ok(
            ApiResponse.<List<Category>>builder()
                .status(200)
                .message("Success")
                .data(categoryRepository.findAll())
                .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Category category) {
        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(201).body(
            ApiResponse.<Category>builder()
                .status(201)
                .message("Created category")
                .data(saved)
                .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Long id, @RequestBody Category categoryUpdate) {
        return categoryRepository.findById(id).map(existing -> {
            if (categoryUpdate.getName() != null) existing.setName(categoryUpdate.getName());
            if (categoryUpdate.getDescription() != null) existing.setDescription(categoryUpdate.getDescription());

            Category saved = categoryRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.<Category>builder()
                .status(200)
                .message("Updated category")
                .data(saved)
                .build()
            );
        }).orElseGet(() -> ResponseEntity.status(404).body(
            ApiResponse.<Category>builder()
                .status(404)
                .message("Category not found")
                .build()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).map(existing -> {
            categoryRepository.delete(existing);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Deleted category")
                .build()
            );
        }).orElseGet(() -> ResponseEntity.status(404).body(
            ApiResponse.<Void>builder()
                .status(404)
                .message("Category not found")
                .build()
        ));
    }
}
