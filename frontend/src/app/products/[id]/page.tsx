"use client";
import React, { use, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { getProduct, Product, ProductVariant } from "@/lib/api";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10);

  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    getProduct(productId)
      .then((res) => {
        if (res.data) {
          setProduct(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariant(res.data.variants[0]);
          }
        } else {
          setError("Không tìm thấy sản phẩm");
        }
      })
      .catch((err) => {
        setError(err.message || "Lỗi tải thông tin sản phẩm");
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    setSuccessMsg(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <p>{error || "Không tìm thấy sản phẩm"}</p>
      </div>
    );
  }

  // Calculate unique colors and sizes
  const colors = [...new Set(product.variants?.map((v) => v.color) || [])];
  const sizes = [...new Set(product.variants?.map((v) => v.size) || [])];

  const handleSelectVariant = (color: string, size: string) => {
    const match = product.variants.find((v) => v.color === color && v.size === size);
    if (match) setSelectedVariant(match);
  };

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : 0;

  return (
    <div className="page">
      <div className="product-detail">
        <div className="product-detail-img">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
          ) : (
            <span>👔</span>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <span className="product-detail-price">${product.basePrice.toFixed(2)}</span>
          <p className="product-detail-desc">{product.description}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Color selection */}
            <div>
              <h4 className="variant-label">Màu sắc</h4>
              <div className="variant-grid">
                {colors.map((color) => {
                  const isActive = selectedVariant?.color === color;
                  return (
                    <button
                      key={color}
                      className={`variant-btn ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectVariant(color, selectedVariant?.size || "")}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selection */}
            <div>
              <h4 className="variant-label">Kích thước</h4>
              <div className="variant-grid">
                {sizes.map((size) => {
                  const isActive = selectedVariant?.size === size;
                  return (
                    <button
                      key={size}
                      className={`variant-btn ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectVariant(selectedVariant?.color || "", size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock indicator */}
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              {currentStock > 0 ? (
                <span>Kho: Còn lại <strong>{currentStock}</strong> sản phẩm</span>
              ) : (
                <span style={{ color: "var(--danger)" }}>Hết hàng</span>
              )}
            </div>

            {/* Quantity and Actions */}
            {currentStock > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "12px" }}>
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  >
                    +
                  </button>
                </div>

                <button className="btn-primary" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </button>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success" style={{ marginTop: "16px" }}>
                {successMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
