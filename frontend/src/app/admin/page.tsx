"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, uploadImage, Product, ProductVariant, Category } from "@/lib/api";
import { isLoggedIn, getRole } from "@/lib/auth";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // New product form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [variants, setVariants] = useState<Omit<ProductVariant, "id">[]>([
    { color: "Black", size: "M", stockQuantity: 20 },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }
    if (getRole() !== "ADMIN") {
      router.push("/");
      return;
    }

    loadProducts();
    loadCategories();
  }, [router]);

  const loadCategories = () => {
    getCategories().then(res => {
      if (res.data) setCategories(res.data);
    }).catch(err => console.error(err));
  };

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => {
        if (res.data) setProducts(res.data);
      })
      .catch((err) => setError("Tải danh sách sản phẩm thất bại"))
      .finally(() => setLoading(false));
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setDescription(product.description);
    setBasePrice(product.basePrice.toString());
    setCategoryId(product.category?.id.toString() || "");
    setVariants(product.variants.map(v => ({ color: v.color, size: v.size, stockQuantity: v.stockQuantity })));
    setExistingImageUrl(product.imageUrl || null);
    setImagePreview(null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      await deleteProduct(id);
      setSuccess("Xóa sản phẩm thành công!");
      loadProducts();
    } catch (err: any) {
      setError(err.message || "Xóa sản phẩm thất bại");
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { color: "Trắng", size: "L", stockQuantity: 10 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof Omit<ProductVariant, "id">,
    value: string | number
  ) => {
    setVariants(
      variants.map((v, i) => {
        if (i === index) {
          return { ...v, [field]: value };
        }
        return v;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const price = parseFloat(basePrice);
    if (isNaN(price) || price <= 0) {
      setError("Vui lòng nhập giá gốc hợp lệ");
      return;
    }

    if (variants.length === 0) {
      setError("Vui lòng thêm ít nhất một biến thể");
      return;
    }

    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        if (uploadRes.status === 200) {
          imageUrl = uploadRes.data;
        }
      }

      const payload: any = {
        name,
        description,
        basePrice: price,
        imageUrl,
        variants: variants.map((v) => ({
          color: v.color,
          size: v.size,
          stockQuantity: parseInt(v.stockQuantity.toString(), 10),
        })),
      };

      if (categoryId) {
        payload.categoryId = parseInt(categoryId, 10);
      }

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setSuccess("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(payload);
        setSuccess("Tạo sản phẩm thành công!");
      }

      setName("");
      setDescription("");
      setBasePrice("");
      setCategoryId("");
      setImageFile(null);
      setExistingImageUrl(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setVariants([{ color: "Đen", size: "M", stockQuantity: 20 }]);
      setShowModal(false);
      setEditingProductId(null);
      loadProducts();
    } catch (err: any) {
      setError(err.message || "Lưu sản phẩm thất bại");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h4 className="sidebar-title">Menu</h4>
        <Link href="/admin" className="sidebar-link active">
          📦 Sản phẩm
        </Link>
        <Link href="/admin/categories" className="sidebar-link">
          🏷️ Danh mục
        </Link>
        <Link href="/admin/orders" className="sidebar-link">
          🛒 Đơn hàng
        </Link>
        <Link href="/admin/users" className="sidebar-link">
          👥 Người dùng
        </Link>
        <Link href="/admin/discounts" className="sidebar-link">
          🎟️ Vouchers
        </Link>
        <Link href="/admin/settings" className="sidebar-link">
          ⚙️ Cài đặt
        </Link>
      </aside>
      
      <main className="admin-content">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1 className="page-title">Quản trị cửa hàng</h1>
              <p className="page-subtitle">Quản lý kho hàng, thêm sản phẩm và các biến thể</p>
            </div>
        <button className="btn-primary" onClick={() => {
          setEditingProductId(null);
          setName("");
          setDescription("");
          setBasePrice("");
          setCategoryId("");
          setExistingImageUrl(null);
          if (imagePreview) URL.revokeObjectURL(imagePreview);
          setImagePreview(null);
          setImageFile(null);
          setVariants([{ color: "Đen", size: "M", stockQuantity: 20 }]);
          setShowModal(true);
        }}>
          + Thêm sản phẩm
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛍️</div>
          <p>Chưa có sản phẩm nào trong cửa hàng. Hãy thêm mới!</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên sản phẩm</th>
              <th>Giá gốc</th>
              <th>Mô tả</th>
              <th>Biến thể (Màu - Cỡ - Số lượng)</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td style={{ fontWeight: 600 }}>{product.name}</td>
                <td>${product.basePrice.toFixed(2)}</td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {product.description}
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {product.variants?.map((v, i) => (
                      <span
                        key={v.id || i}
                        style={{
                          fontSize: "0.75rem",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {v.color} - {v.size} ({v.stockQuantity} chiếc)
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn-outline-sm" title="Sửa" onClick={() => openEditModal(product)}>✏️</button>
                    <button className="btn-outline-sm" title="Xóa" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDeleteProduct(product.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="modal-title">{editingProductId ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên sản phẩm</label>
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
                  style={{ minHeight: "80px", fontFamily: "inherit" }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giá gốc ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="form-input"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select
                  className="form-input"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ảnh sản phẩm</label>
                {(imagePreview || existingImageUrl) && (
                  <div style={{ marginBottom: "12px" }}>
                    <img 
                      src={imagePreview || (existingImageUrl && !existingImageUrl.startsWith("http") ? `http://localhost:8082${existingImageUrl}` : existingImageUrl) as string} 
                      alt="Preview" 
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }} 
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) {
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImagePreview(null);
                    }
                  }}
                />
              </div>

              <div style={{ margin: "24px 0 16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h4 style={{ fontWeight: 600 }}>Biến thể</h4>
                  <button
                    type="button"
                    className="btn-outline-sm"
                    onClick={handleAddVariant}
                  >
                    + Thêm biến thể
                  </button>
                </div>

                {variants.map((v, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Màu sắc"
                      required
                      className="form-input"
                      style={{ flex: 2 }}
                      value={v.color}
                      onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Kích cỡ"
                      required
                      className="form-input"
                      style={{ flex: 1 }}
                      value={v.size}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="SL"
                      required
                      className="form-input"
                      style={{ flex: 1 }}
                      value={v.stockQuantity}
                      onChange={(e) =>
                        handleVariantChange(index, "stockQuantity", parseInt(e.target.value, 10))
                      }
                    />
                    {variants.length > 1 && (
                      <button
                        type="button"
                        className="btn-outline-sm"
                        style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                        onClick={() => handleRemoveVariant(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {editingProductId ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
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
