package com.example.order_service.client;

import com.example.order_service.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "discount-service", url = "http://discount-service:8085")
public interface DiscountClient {

    @GetMapping("/api/v1/discounts/validate")
    ApiResponse<Map<String, Object>> validateDiscount(
            @RequestParam("code") String code,
            @RequestParam("orderAmount") Double orderAmount);

    @PutMapping("/api/v1/discounts/use")
    void useDiscount(@RequestParam("code") String code);
}
