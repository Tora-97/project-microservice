"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, updateCartQuantity, CartItem } from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  const handleUpdateQuantity = (item: CartItem, newQty: number) => {
    updateCartQuantity(item.productId, item.variantId, newQty);
    setCart(getCart()); // Reload cart from local storage
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "32px" }}>Giỏ hàng của bạn</h1>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link href="/shop" className="btn-primary" style={{ marginTop: "16px" }}>Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Cart Items List */}
          <div style={{ flex: "1 1 600px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} style={{ 
                  display: "flex", 
                  gap: "24px", 
                  padding: "24px", 
                  background: "var(--surface)", 
                  borderRadius: "16px",
                  border: "1px solid var(--border)"
                }}>
                  {/* Item Image */}
                  <div style={{ width: "120px", height: "120px", borderRadius: "8px", background: "var(--surface-2)", overflow: "hidden", flexShrink: 0 }}>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:8080${item.imageUrl}`} 
                        alt={item.productName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>Không có ảnh</div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <Link href={`/shop/${item.productId}`} style={{ textDecoration: "none", color: "inherit" }}>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{item.productName}</h3>
                        </Link>
                        <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Màu sắc: {item.variantColor}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>Kích thước: {item.variantSize}</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button 
                          className="btn-outline-sm" 
                          style={{ width: "32px", height: "32px", padding: 0, borderRadius: "50%" }}
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 600, width: "20px", textAlign: "center" }}>{item.quantity}</span>
                        <button 
                          className="btn-outline-sm" 
                          style={{ width: "32px", height: "32px", padding: 0, borderRadius: "50%" }}
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, textDecoration: "underline" }}
                        onClick={() => handleUpdateQuantity(item, 0)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ 
            flex: "1 1 300px", 
            background: "var(--surface)", 
            padding: "32px", 
            borderRadius: "16px",
            border: "1px solid var(--border)",
            position: "sticky",
            top: "24px"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "24px" }}>Tóm tắt đơn hàng</h2>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--text-muted)" }}>
              <span>Tạm tính</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--text-muted)" }}>
              <span>Giao hàng</span>
              <span>Miễn phí</span>
            </div>
            
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "1.5rem", fontWeight: 800 }}>
              <span>Tổng cộng</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="btn-primary" style={{ width: "100%", display: "block", textAlign: "center", padding: "16px", fontSize: "1.1rem", borderRadius: "12px" }}>
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
