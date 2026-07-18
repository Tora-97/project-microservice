"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import { createOrder, validateDiscount, updateUser } from "@/lib/api";
import { isLoggedIn, getUserId, getFullName, getPhone, getAddress, updateLocalProfile } from "@/lib/auth";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Form State (loaded from account details)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Profile Verification States
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Voucher State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
    if (isLoggedIn()) {
      setFullName(getFullName() || "");
      setPhone(getPhone() || "");
      setAddress(getAddress() || "");
    }
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleUpdateProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    const userIdStr = getUserId();
    if (!userIdStr) {
      setProfileMessage({ type: "error", text: "Không tìm thấy thông tin tài khoản của bạn." });
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setProfileMessage({ type: "error", text: "Họ và tên, Số điện thoại và Địa chỉ giao hàng không được để trống!" });
      return;
    }

    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const userId = parseInt(userIdStr, 10);
      await updateUser(userId, {
        fullName,
        phone,
        address
      });
      updateLocalProfile(fullName, phone, address);
      setProfileMessage({ type: "success", text: "Đã cập nhật thông tin tài khoản thành công!" });
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Cập nhật thông tin thất bại." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const orderAmount = calculateTotal();
      const res = await validateDiscount(couponCode.trim(), orderAmount);
      if (res.data && res.data.valid) {
        setDiscountAmount(res.data.discountAmount);
        setAppliedCoupon(couponCode.trim());
        setCouponSuccess(res.data.message || "Áp dụng mã giảm giá thành công!");
      } else {
        setDiscountAmount(0);
        setAppliedCoupon(null);
        setCouponError(res.data?.message || "Mã giảm giá không hợp lệ.");
      }
    } catch (err: any) {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      setCouponError(err.message || "Không thể xác minh mã giảm giá.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    if (!profileConfirmed) {
      setError("Vui lòng xác nhận thông tin tài khoản và địa chỉ giao hàng trước khi đặt hàng!");
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const userIdStr = getUserId();
      const userId = userIdStr ? parseInt(userIdStr, 10) : 1;

      const orderItems = cart.map(item => ({
        productId: item.productId,
        productVariantId: item.variantId,
        quantity: item.quantity
      }));

      const res = await createOrder(userId, orderItems, appliedCoupon || undefined);
      const newOrderId = res.data?.id;
      const finalTotal = calculateTotal() - discountAmount;
      
      clearCart();
      router.push(`/checkout/success?orderId=${newOrderId}&total=${finalTotal.toFixed(2)}&discount=${discountAmount.toFixed(2)}`);
    } catch (err: any) {
      setError(err.message || "Đặt hàng thất bại. Biến thể sản phẩm có thể đã hết hàng.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: "800px", margin: "80px auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Giỏ hàng của bạn đang trống</h2>
        <Link href="/products" className="btn-primary" style={{ marginTop: "24px", display: "inline-block" }}>
          Đi mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>Thanh toán đơn hàng</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
        Vui lòng kiểm tra lại thông tin tài khoản và giao hàng của bạn trước khi tiến hành thanh toán.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: "24px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Checkout Flow / Review Account Information */}
        <div style={{ flex: "1 1 550px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ background: "var(--surface)", padding: "32px", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>1. Kiểm tra thông tin tài khoản</h2>
              <span style={{ fontSize: "0.8rem", background: "var(--primary-light)", color: "var(--primary)", padding: "4px 10px", borderRadius: "20px", fontWeight: 600 }}>Tài khoản của bạn</span>
            </div>

            <form>
              <div className="form-group">
                <label className="form-label">Họ và tên người nhận</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Họ và tên đầy đủ" 
                  required 
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setProfileConfirmed(false);
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại liên hệ</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="09XXXXXXXX" 
                  required 
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setProfileConfirmed(false);
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ nhận hàng</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố" 
                  required 
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setProfileConfirmed(false);
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "12px", alignItems: "center" }}>
                {profileMessage && (
                  <span style={{ 
                    fontSize: "0.85rem", 
                    color: profileMessage.type === "success" ? "#10b981" : "var(--danger)" 
                  }}>
                    {profileMessage.type === "success" ? "✓" : "❌"} {profileMessage.text}
                  </span>
                )}
                <button
                  type="button"
                  className="btn-outline-sm"
                  onClick={handleUpdateProfile}
                  disabled={profileSaving}
                  style={{ minWidth: "150px" }}
                >
                  {profileSaving ? "Đang lưu..." : "Lưu & Cập nhật"}
                </button>
              </div>
            </form>
          </div>

          <div style={{ background: "var(--surface)", padding: "32px", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "20px" }}>2. Xác nhận & Đặt hàng</h2>

            <div style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--surface-2)", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              <strong>Chế độ thử nghiệm:</strong> Đơn hàng sẽ được tạo lập và ghi nhận trực tiếp vào hệ thống cơ sở dữ liệu.
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "24px" }}>
              <input
                id="confirm-profile"
                type="checkbox"
                style={{ width: "20px", height: "20px", marginTop: "2px", cursor: "pointer" }}
                checked={profileConfirmed}
                onChange={(e) => setProfileConfirmed(e.target.checked)}
              />
              <label 
                htmlFor="confirm-profile" 
                style={{ fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
              >
                Tôi đã kiểm tra và xác nhận thông tin người nhận & địa chỉ giao hàng ở trên hoàn toàn chính xác.
              </label>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="btn-primary" 
              style={{ 
                width: "100%", 
                padding: "16px", 
                fontSize: "1.1rem", 
                borderRadius: "12px",
                opacity: profileConfirmed ? 1 : 0.6,
                cursor: profileConfirmed ? "pointer" : "not-allowed"
              }}
              disabled={loading || !profileConfirmed}
            >
              {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ flex: "1 1 350px", background: "var(--surface-2)", padding: "32px", borderRadius: "16px", position: "sticky", top: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px" }}>Sản phẩm mua sắm</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", maxHeight: "300px", overflowY: "auto" }}>
            {cart.map(item => (
              <div key={`${item.productId}-${item.variantId}`} style={{ display: "flex", gap: "12px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "var(--surface)", overflow: "hidden", flexShrink: 0 }}>
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:8080${item.imageUrl}`} 
                      alt={item.productName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{item.productName}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cỡ: {item.variantSize} | Màu: {item.variantColor} x {item.quantity}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, marginTop: "4px" }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
          
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />

          {/* Coupon Code Section */}
          <div style={{ marginBottom: "24px" }}>
            <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>Mã giảm giá (Voucher)</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input
                type="text"
                className="form-input"
                style={{ margin: 0, padding: "8px 12px", fontSize: "0.9rem" }}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: "8px 16px", borderColor: "var(--danger)", color: "var(--danger)" }}
                  onClick={() => {
                    setAppliedCoupon(null);
                    setDiscountAmount(0);
                    setCouponCode("");
                    setCouponSuccess(null);
                  }}
                >
                  Xoá
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: "8px 16px" }}
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                >
                  {validatingCoupon ? "..." : "Áp dụng"}
                </button>
              )}
            </div>
            {couponError && <div style={{ fontSize: "0.8rem", color: "var(--danger)", marginTop: "6px" }}>❌ {couponError}</div>}
            {couponSuccess && <div style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "6px" }}>✓ {couponSuccess}</div>}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />

          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-muted)" }}>
              <span>Tạm tính</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "0.95rem", color: "#10b981" }}>
              <span>Giảm giá</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "1.2rem", fontWeight: 800 }}>
            <span>Tổng thanh toán</span>
            <span>${(calculateTotal() - discountAmount).toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
