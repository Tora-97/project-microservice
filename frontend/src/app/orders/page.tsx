"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrders, Order } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }

    // Hardcode user ID 1 for demo purposes
    getOrders(1)
      .then((res) => {
        if (res.data) {
          setOrders(res.data);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="page-title">Đơn hàng của tôi</h1>
      <p className="page-subtitle">Theo dõi trạng thái đơn hàng của bạn</p>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>Bạn chưa đặt đơn hàng nào.</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <span className="order-id">Đơn hàng #{order.id}</span>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Mã người dùng: {order.userId}
                  </div>
                </div>
                <span className="order-status">{order.status}</span>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
                {order.items && order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                      padding: "4px 0",
                    }}
                  >
                    <span>
                      Mã sản phẩm: <strong>{item.productId}</strong> (Mẫu: {item.productVariantId}) x {item.quantity}
                    </span>
                    <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  marginTop: "16px",
                  borderTop: "1px dashed var(--border)",
                  paddingTop: "12px",
                }}
              >
                <span>Tổng số tiền:</span>
                <span>${(order.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
