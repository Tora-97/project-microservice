"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDiscounts, createDiscount, deleteDiscount, Discount } from "@/lib/api";
import { isLoggedIn, getRole } from "@/lib/auth";
import Link from "next/link";

export default function AdminDiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [maxDiscountValue, setMaxDiscountValue] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn() || getRole() !== "ADMIN") {
      router.push("/");
      return;
    }
    loadDiscounts();
  }, [router]);

  const loadDiscounts = () => {
    setLoading(true);
    getDiscounts()
      .then((res) => {
        if (res.data) setDiscounts(res.data);
      })
      .catch(() => setError("Tải danh sách mã giảm giá thất bại"))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) return;
    try {
      await deleteDiscount(id);
      setSuccess("Xóa mã giảm giá thành công!");
      loadDiscounts();
    } catch (err: any) {
      setError(err.message || "Xóa mã giảm giá thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createDiscount({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minOrderValue,
        maxDiscountValue,
        usageLimit
      });
      setSuccess("Tạo mã giảm giá thành công!");
      setShowModal(false);
      
      // Reset form
      setCode("");
      setDiscountType("PERCENT");
      setDiscountValue(0);
      setMinOrderValue(0);
      setMaxDiscountValue(0);
      setUsageLimit(100);
      
      loadDiscounts();
    } catch (err: any) {
      setError(err.message || "Tạo mã giảm giá thất bại");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h4 className="sidebar-title">Menu</h4>
        <Link href="/admin" className="sidebar-link">📦 Sản phẩm</Link>
        <Link href="/admin/categories" className="sidebar-link">🏷️ Danh mục</Link>
        <Link href="/admin/orders" className="sidebar-link">🛒 Đơn hàng</Link>
        <Link href="/admin/users" className="sidebar-link">👥 Người dùng</Link>
        <Link href="/admin/discounts" className="sidebar-link active">🎟️ Vouchers</Link>
        <Link href="/admin/settings" className="sidebar-link">⚙️ Cài đặt</Link>
      </aside>

      <main className="admin-content">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1 className="page-title">Quản lý Vouchers</h1>
              <p className="page-subtitle">Thêm hoặc xóa các chương trình khuyến mãi, mã giảm giá</p>
            </div>
            <button className="btn-primary" onClick={() => {
              setCode("");
              setDiscountType("PERCENT");
              setDiscountValue(0);
              setMinOrderValue(0);
              setMaxDiscountValue(0);
              setUsageLimit(100);
              setShowModal(true);
            }}>
              ➕ Thêm Voucher
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : discounts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎟️</div>
              <p>Chưa có mã giảm giá nào được tạo.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Giảm tối đa</th>
                  <th>Giới hạn lượt dùng</th>
                  <th>Đã dùng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>{d.code}</td>
                    <td>{d.discountType === "PERCENT" ? "Phần trăm (%)" : "Cố định ($)"}</td>
                    <td>{d.discountType === "PERCENT" ? `${d.discountValue}%` : `$${d.discountValue.toFixed(2)}`}</td>
                    <td>${d.minOrderValue.toFixed(2)}</td>
                    <td>{d.maxDiscountValue > 0 ? `$${d.maxDiscountValue.toFixed(2)}` : "Không giới hạn"}</td>
                    <td>{d.usageLimit}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{d.usedCount}</span> / {d.usageLimit}
                    </td>
                    <td>
                      <button className="btn-outline-sm" title="Xóa" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(d.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2 className="modal-title">Thêm mã giảm giá mới</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Mã Code (In hoa, không khoảng trắng)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: SUMMER20"
                      className="form-input"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Loại giảm giá</label>
                      <select
                        className="form-input"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <option value="PERCENT">Phần trăm (%)</option>
                        <option value="FIXED">Giá trị cố định ($)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Giá trị giảm</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="form-input"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Giá trị đơn hàng tối thiểu ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={minOrderValue}
                        onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Giảm tối đa (Áp dụng cho %)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Để 0 nếu không giới hạn"
                        className="form-input"
                        value={maxDiscountValue}
                        onChange={(e) => setMaxDiscountValue(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lượt sử dụng tối đa</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                      Tạo Voucher
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
