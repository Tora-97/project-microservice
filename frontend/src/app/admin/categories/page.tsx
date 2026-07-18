"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from "@/lib/api";
import { isLoggedIn, getRole } from "@/lib/auth";
import Link from "next/link";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn() || getRole() !== "ADMIN") {
      router.push("/");
      return;
    }
    loadCategories();
  }, [router]);

  const loadCategories = () => {
    setLoading(true);
    getCategories()
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch(() => setError("Tải danh sách danh mục thất bại"))
      .finally(() => setLoading(false));
  };

  const openEditModal = (category: Category) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) return;
    try {
      await deleteCategory(id);
      setSuccess("Xóa danh mục thành công!");
      loadCategories();
    } catch (err: any) {
      setError(err.message || "Xóa danh mục thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, { name, description });
        setSuccess("Cập nhật danh mục thành công!");
      } else {
        await createCategory({ name, description });
        setSuccess("Tạo danh mục thành công!");
      }
      setShowModal(false);
      setEditingCategoryId(null);
      setName("");
      setDescription("");
      loadCategories();
    } catch (err: any) {
      setError(err.message || "Lưu danh mục thất bại");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h4 className="sidebar-title">Menu</h4>
        <Link href="/admin" className="sidebar-link">📦 Sản phẩm</Link>
        <Link href="/admin/categories" className="sidebar-link active">🏷️ Danh mục</Link>
        <Link href="/admin/orders" className="sidebar-link">🛒 Đơn hàng</Link>
        <Link href="/admin/users" className="sidebar-link">👥 Người dùng</Link>
        <Link href="/admin/discounts" className="sidebar-link">🎟️ Vouchers</Link>
        <Link href="/admin/settings" className="sidebar-link">⚙️ Cài đặt</Link>
      </aside>

      <main className="admin-content">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1 className="page-title">Quản lý danh mục</h1>
              <p className="page-subtitle">Thêm, sửa hoặc xóa danh mục sản phẩm</p>
            </div>
            <button className="btn-primary" onClick={() => {
              setEditingCategoryId(null);
              setName("");
              setDescription("");
              setShowModal(true);
            }}>
              + Thêm danh mục
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏷️</div>
              <p>Không tìm thấy danh mục nào.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.description}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-outline-sm" title="Sửa" onClick={() => openEditModal(c)}>✏️</button>
                        <button className="btn-outline-sm" title="Xóa" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(c.id)}>🗑️</button>
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
                <h2 className="modal-title">{editingCategoryId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Tên danh mục</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-input"
                      style={{ minHeight: "80px" }}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                      {editingCategoryId ? "Cập nhật danh mục" : "Tạo danh mục"}
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
