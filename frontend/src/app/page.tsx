"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts, Product } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isLoggedIn());
    getProducts()
      .then((res) => {
        if (res.data) {
          setProducts(res.data.slice(0, 4)); // Show first 4 as featured
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero-split">
        <div className="hero-split-text">
          <span className="hero-split-tag">Bộ sưu tập mới nhất</span>
          <h1 className="hero-split-title">
            Kiến tạo Phong cách <span>Cá nhân</span>
          </h1>
          <p className="hero-split-desc">
            Khám phá các thiết kế thời trang tối giản nhưng đầy cuốn hút, được chọn lọc kỹ lưỡng để mang lại sự thoải mái và tự tin cho bạn mỗi ngày.
          </p>
          <div className="hero-split-actions">
            <Link href="/products" className="btn-primary">
              Mua sắm ngay <span>→</span>
            </Link>
            {!auth && (
              <Link href="/auth/register" className="btn-outline">
                Tạo tài khoản
              </Link>
            )}
          </div>
        </div>
        <div className="hero-split-visual">
          <img 
            src="/hero_banner.png" 
            alt="ThreadCraft Editorial Fashion Banner" 
          />
        </div>
      </section>

      {/* Collections Section */}
      <section className="section" style={{ padding: '0 0 32px' }}>
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <h2 className="section-title">Danh mục nổi bật</h2>
        </div>
        <div className="collections-grid">
          <Link href="/products?categoryId=1" className="collection-card">
            <div className="collection-img-wrap">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80" alt="Áo Thiết Kế" />
            </div>
            <div className="collection-content">
              <span className="collection-subtitle">Bộ sưu tập áo</span>
              <h3 className="collection-title">Áo Nam Thiết Kế</h3>
            </div>
          </Link>
          <Link href="/products?categoryId=2" className="collection-card">
            <div className="collection-img-wrap">
              <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80" alt="Quần Chinos & Jeans" />
            </div>
            <div className="collection-content">
              <span className="collection-subtitle">Dáng quần hiện đại</span>
              <h3 className="collection-title">Quần Nam Chinos & Jeans</h3>
            </div>
          </Link>
          <Link href="/products?categoryId=4" className="collection-card">
            <div className="collection-img-wrap">
              <img src="https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=500&q=80" alt="Phụ Kiện Thời Trang" />
            </div>
            <div className="collection-content">
              <span className="collection-subtitle">Mảnh ghép hoàn hảo</span>
              <h3 className="collection-title">Phụ Kiện Thời Trang</h3>
            </div>
          </Link>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '32px' }}>
        <div className="section-header">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <Link href="/products" className="section-link">
            Xem tất cả sản phẩm →
          </Link>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👕</div>
            <p>Chưa có sản phẩm nào. Vui lòng quay lại sau!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="features" style={{ borderTop: '1px solid var(--border)', marginTop: '40px' }}>
        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3 className="feature-title">Miễn phí vận chuyển</h3>
          <p className="feature-desc">Được áp dụng cho mọi đơn hàng từ $100. Giao hàng nhanh từ 2 - 3 ngày làm việc.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3 className="feature-title">Thanh toán bảo mật</h3>
          <p className="feature-desc">Mã hóa dữ liệu 256-bit bảo vệ tuyệt đối thông tin thẻ và tài khoản ngân hàng.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3 className="feature-title">Đổi trả tiện lợi</h3>
          <p className="feature-desc">Hỗ trợ đổi size hoặc hoàn tiền lên đến 30 ngày nếu phát sinh lỗi từ nhà sản xuất.</p>
        </div>
      </section>
    </div>
  );
}
