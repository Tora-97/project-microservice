"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Footer() {
  const [storeName, setStoreName] = useState("ThreadCraft");

  const updateStoreName = () => {
    try {
      const stored = localStorage.getItem("store_settings");
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.storeName) {
          setStoreName(settings.storeName);
        }
      }
    } catch (e) {
      console.error("Error updating store name in footer:", e);
    }
  };

  useEffect(() => {
    updateStoreName();
    window.addEventListener("store_settings_updated", updateStoreName);
    return () => {
      window.removeEventListener("store_settings_updated", updateStoreName);
    };
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-brand-title">
              <span>{storeName}</span>
            </Link>
            <p className="footer-brand-desc">
              Hệ thống cửa hàng thời trang thiết kế cao cấp với mô hình microservices hiện đại, mang lại trải nghiệm mua sắm mượt mà và an toàn.
            </p>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Khám phá</h3>
            <div className="footer-links">
              <Link href="/products">Tất cả sản phẩm</Link>
              <Link href="/products?categoryId=1">Áo Nam</Link>
              <Link href="/products?categoryId=2">Quần Nam</Link>
              <Link href="/products?categoryId=4">Phụ kiện</Link>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Hỗ trợ</h3>
            <div className="footer-links">
              <Link href="/help/shipping">Giao hàng & Thanh toán</Link>
              <Link href="/help/returns">Chính sách đổi trả</Link>
              <Link href="/help/privacy">Chính sách bảo mật</Link>
              <Link href="/help/terms">Điều khoản sử dụng</Link>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Liên hệ</h3>
            <div className="footer-info">
              <div className="footer-info-item">
                <span>📍</span>
                <span>Tòa nhà Innovation, TP. Hồ Chí Minh</span>
              </div>
              <div className="footer-info-item">
                <span>📞</span>
                <span>Hotline: 1900 1234 (8h - 22h)</span>
              </div>
              <div className="footer-info-item">
                <span>✉️</span>
                <span>Email: support@threadcraft.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {storeName}. Tất cả các quyền được bảo lưu. Thiết kế bởi Antigravity.
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">🌐</a>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="YouTube">📺</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
