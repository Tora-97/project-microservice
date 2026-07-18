"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const total = searchParams.get("total");
  const discount = searchParams.get("discount");

  return (
    <div className="auth-page" style={{ padding: "60px 20px" }}>
      <div className="auth-card" style={{ maxWidth: "600px", textAlign: "center", padding: "48px 40px" }}>
        
        {/* Animated Checkmark Icon */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "#ecfdf5",
          border: "4px solid #10b981",
          color: "#10b981",
          fontSize: "2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontWeight: "bold"
        }}>
          ✓
        </div>

        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "12px", color: "var(--text)" }}>Đặt hàng thành công!</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "32px" }}>
          Cảm ơn bạn đã mua sắm tại <strong>ThreadCraft</strong>. Đơn hàng của bạn đã được ghi nhận vào hệ thống và đang được xử lý.
        </p>

        {/* Order Details Card */}
        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "left",
          marginBottom: "32px"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>Chi tiết đơn hàng</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Mã đơn hàng:</span>
              <strong style={{ fontFamily: "monospace", color: "var(--text)" }}>#{orderId || "N/A"}</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Phương thức thanh toán:</span>
              <span style={{ fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</span>
            </div>

            {discount && parseFloat(discount) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Giảm giá voucher:</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>-${parseFloat(discount).toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
              <strong style={{ color: "var(--text)" }}>Tổng thanh toán:</strong>
              <strong style={{ color: "var(--primary)", fontSize: "1.2rem" }}>${total ? parseFloat(total).toFixed(2) : "0.00"}</strong>
            </div>
          </div>
        </div>

        {/* Success Page Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/" className="btn-primary btn-full" style={{ padding: "14px", borderRadius: "8px", fontWeight: 600 }}>
            Quay lại Trang chủ
          </Link>
          <Link href="/products" className="btn-outline btn-full" style={{ padding: "14px", borderRadius: "8px", fontWeight: 600 }}>
            Tiếp tục mua sắm
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="loading">
        <div className="spinner"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
