"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct, Product, ProductVariant } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadProduct(parseInt(params.id as string));
    }
  }, [params.id]);

  const loadProduct = async (id: number) => {
    try {
      const res = await getProduct(id);
      if (res.data) {
        setProduct(res.data);
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedColor(res.data.variants[0].color);
          setSelectedSize(res.data.variants[0].size);
        }
      }
    } catch (err) {
      setError("Lỗi tải thông tin chi tiết sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const variant = product.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );

    if (!variant) {
      setError("Mẫu sản phẩm đã chọn không có sẵn.");
      return;
    }

    if (variant.stockQuantity <= 0) {
      setError("Mẫu sản phẩm đã chọn đã hết hàng.");
      return;
    }

    addToCart({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantColor: variant.color,
      variantSize: variant.size,
      price: product.basePrice,
      imageUrl: product.imageUrl
    });

    setSuccess("Đã thêm vào giỏ hàng thành công!");
    setError(null);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  if (loading) {
    return (
      <div className="loading" style={{ height: "60vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state" style={{ height: "60vh" }}>
        <div className="empty-state-icon">❌</div>
        <p>Không tìm thấy sản phẩm.</p>
        <Link href="/shop" className="btn-primary" style={{ marginTop: "16px" }}>Quay lại cửa hàng</Link>
      </div>
    );
  }

  // Get unique colors and sizes for the selectors
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const sizes = Array.from(new Set(product.variants.map(v => v.size)));

  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/shop" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
        ← Quay lại cửa hàng
      </Link>

      <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
        {/* Image Gallery */}
        <div style={{ flex: "1 1 500px" }}>
          <div style={{ 
            width: "100%", 
            aspectRatio: "1/1", 
            background: "var(--surface-2)", 
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--border)"
          }}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl.startsWith("http") ? product.imageUrl : `http://localhost:8080${product.imageUrl}`} 
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                Không có ảnh
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div style={{ flex: "1 1 400px" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {product.category?.name || "Chưa phân loại"}
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "16px", lineHeight: 1.1 }}>
            {product.name}
          </h1>
          <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "24px" }}>
            ${product.basePrice.toFixed(2)}
          </div>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "32px" }}>
            {product.description}
          </p>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "32px" }} />

          {/* Color Selector */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>Màu sắc</h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "30px",
                    border: selectedColor === color ? "2px solid var(--text)" : "1px solid var(--border)",
                    background: selectedColor === color ? "var(--text)" : "transparent",
                    color: selectedColor === color ? "var(--background)" : "var(--text)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>Kích thước</h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: selectedSize === size ? "2px solid var(--text)" : "1px solid var(--border)",
                    background: selectedSize === size ? "var(--text)" : "transparent",
                    color: selectedSize === size ? "var(--background)" : "var(--text)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div style={{ marginBottom: "32px", fontSize: "0.9rem" }}>
            {selectedVariant ? (
              selectedVariant.stockQuantity > 0 ? (
                <span style={{ color: "var(--success)", fontWeight: 600 }}>✓ Còn hàng ({selectedVariant.stockQuantity} sản phẩm)</span>
              ) : (
                <span style={{ color: "var(--danger)", fontWeight: 600 }}>✕ Hết hàng</span>
              )
            ) : (
              <span style={{ color: "var(--text-muted)" }}>Sự kết hợp màu sắc và kích thước này không có sẵn.</span>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
            <button 
              className="btn-primary" 
              style={{ width: "100%", padding: "16px", fontSize: "1.1rem", borderRadius: "12px" }}
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
            >
              Thêm vào giỏ hàng
            </button>
            
            {error && <div className="alert alert-error">{error}</div>}
            {success && (
              <div className="alert alert-success" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{success}</span>
                <Link href="/cart" style={{ fontWeight: 700, color: "inherit", textDecoration: "underline" }}>Xem giỏ hàng →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
