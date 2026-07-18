"use client";
import React, { useEffect, useState } from "react";
import { getProducts, getCategories, Product, Category } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(undefined, selectedCategory || undefined)
      .then((res) => {
        if (res.data) setProducts(res.data);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="admin-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Danh mục sản phẩm</h1>
          <p className="page-subtitle">Khám phá bộ sưu tập quần áo chất lượng của chúng tôi</p>
        </div>
        <div style={{ width: "300px" }}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button 
            className={`btn-outline-sm ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
            style={selectedCategory === null ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : {}}
          >
            Tất cả sản phẩm
          </button>
          {categories.map(c => (
            <button 
              key={c.id} 
              className={`btn-outline-sm ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
              style={selectedCategory === c.id ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : {}}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>Không tìm thấy sản phẩm nào khớp với &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
