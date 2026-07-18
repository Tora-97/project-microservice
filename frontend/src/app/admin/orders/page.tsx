"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrders, updateOrder, deleteOrder, Order } from "@/lib/api";
import { isLoggedIn, getRole } from "@/lib/auth";
import Link from "next/link";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn() || getRole() !== "ADMIN") {
      router.push("/");
      return;
    }
    loadOrders();
  }, [router]);

  const loadOrders = () => {
    setLoading(true);
    getOrders()
      .then((res) => {
        if (res.data) setOrders(res.data);
      })
      .catch(() => setError("Tải danh sách đơn hàng thất bại"))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateOrder(id, { status: newStatus });
      setSuccess(`Đã cập nhật trạng thái đơn hàng #${id} thành ${newStatus}`);
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Cập nhật trạng thái đơn hàng thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id}?`)) return;
    try {
      await deleteOrder(id);
      setSuccess("Xóa đơn hàng thành công!");
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Xóa đơn hàng thất bại");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h4 className="sidebar-title">Menu</h4>
        <Link href="/admin" className="sidebar-link">📦 Sản phẩm</Link>
        <Link href="/admin/categories" className="sidebar-link">🏷️ Danh mục</Link>
        <Link href="/admin/orders" className="sidebar-link active">🛒 Đơn hàng</Link>
        <Link href="/admin/users" className="sidebar-link">👥 Người dùng</Link>
        <Link href="/admin/discounts" className="sidebar-link">🎟️ Vouchers</Link>
        <Link href="/admin/settings" className="sidebar-link">⚙️ Cài đặt</Link>
      </aside>

      <main className="admin-content">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1 className="page-title">Quản lý đơn hàng</h1>
              <p className="page-subtitle">Xem, cập nhật trạng thái hoặc xóa đơn hàng của khách hàng</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <p>Không tìm thấy đơn hàng nào.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Mã người dùng</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Chi tiết sản phẩm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>#{order.id}</td>
                    <td>{order.userId}</td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: "6px 12px", minWidth: "120px" }}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        <option value="PENDING">Chờ xử lý (PENDING)</option>
                        <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
                        <option value="SHIPPED">Đang giao (SHIPPED)</option>
                        <option value="DELIVERED">Đã giao (DELIVERED)</option>
                        <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                      </select>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                      ${(order.totalPrice || 0).toFixed(2)}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {order.items?.map((item, i) => (
                          <div key={i}>
                            Sản phẩm #{item.productId} - SL: {item.quantity} (${item.price})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn-outline-sm" 
                        title="Xóa"
                        style={{ color: "var(--danger)", borderColor: "var(--danger)" }} 
                        onClick={() => handleDelete(order.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
