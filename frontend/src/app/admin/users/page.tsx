"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, updateUser, deleteUser, User } from "@/lib/api";
import { isLoggedIn, getRole } from "@/lib/auth";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn() || getRole() !== "ADMIN") {
      router.push("/");
      return;
    }
    loadUsers();
  }, [router]);

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        if (res.data) setUsers(res.data);
      })
      .catch(() => setError("Tải danh sách người dùng thất bại"))
      .finally(() => setLoading(false));
  };

  const openEditModal = (user: User) => {
    setEditingUserId(user.id);
    setEmail(user.email);
    setRole(user.role);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) return;
    try {
      await deleteUser(id);
      setSuccess("Xóa người dùng thành công!");
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Xóa người dùng thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!editingUserId) return; // We only support editing here since registration is public

    try {
      await updateUser(editingUserId, { email, role });
      setSuccess("Cập nhật thông tin người dùng thành công!");
      setShowModal(false);
      setEditingUserId(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Cập nhật người dùng thất bại");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h4 className="sidebar-title">Menu</h4>
        <Link href="/admin" className="sidebar-link">📦 Sản phẩm</Link>
        <Link href="/admin/categories" className="sidebar-link">🏷️ Danh mục</Link>
        <Link href="/admin/orders" className="sidebar-link">🛒 Đơn hàng</Link>
        <Link href="/admin/users" className="sidebar-link active">👥 Người dùng</Link>
        <Link href="/admin/discounts" className="sidebar-link">🎟️ Vouchers</Link>
        <Link href="/admin/settings" className="sidebar-link">⚙️ Cài đặt</Link>
      </aside>

      <main className="admin-content">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1 className="page-title">Quản lý người dùng</h1>
              <p className="page-subtitle">Xem, chỉnh sửa vai trò hoặc xóa tài khoản người dùng</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>Không tìm thấy người dùng nào.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.email}</td>
                    <td>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        background: u.role === "ADMIN" ? "#fee2e2" : "#f3f4f6",
                        color: u.role === "ADMIN" ? "#b91c1c" : "#4b5563"
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-outline-sm" title="Sửa" onClick={() => openEditModal(u)}>✏️</button>
                        <button className="btn-outline-sm" title="Xóa" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(u.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2 className="modal-title">Chỉnh sửa người dùng</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vai trò</label>
                    <select
                      className="form-input"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                      Cập nhật
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
