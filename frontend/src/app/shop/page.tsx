"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, getCategories, Product, Category } from "@/lib/api";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {}
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts(search, selectedCategory ? selectedCategory : undefined);
      if (res.data) setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>Cửa hàng</h1>
          <p style={{ color: "var(--text-muted)" }}>Khám phá bộ sưu tập quần áo cao cấp mới nhất của chúng tôi.</p>
        </div>
        <Link href="/cart" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          🛒 Xem giỏ hàng
        </Link>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Filters Sidebar */}
        <aside style={{ width: "250px", flexShrink: 0 }}>
          <div style={{ position: "sticky", top: "24px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>Bộ lọc</h3>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>Tìm kiếm</label>
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                className="form-input" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>Danh mục</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === ""}
                    onChange={() => setSelectedCategory("")}
                  />
                  <span>Tất cả danh mục</span>
                </label>
                {categories.map(c => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === c.id}
                      onChange={() => setSelectedCategory(c.id)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main style={{ flex: 1 }}>
          {loading ? (
            <div className="loading" style={{ height: "400px" }}>
              <div className="spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state" style={{ height: "400px" }}>
              <div className="empty-state-icon">🛍️</div>
              <p>Không tìm thấy sản phẩm nào khớp với tiêu chí của bạn.</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "24px" 
            }}>
              {products.map(p => (
                <Link href={`/shop/${p.id}`} key={p.id} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "var(--surface)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px -8px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                    <div style={{ height: "280px", background: "var(--surface-2)", position: "relative" }}>
                      {p.imageUrl ? (
                        <img 
                          src={p.imageUrl.startsWith("http") ? p.imageUrl : `http://localhost:8080${p.imageUrl}`} 
                          alt={p.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                          Không có ảnh
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "20px" }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, marginBottom: "4px" }}>
                        {p.category?.name || "Chưa phân loại"}
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>{p.name}</h3>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>${p.basePrice.toFixed(2)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
