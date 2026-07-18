"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getRole } from "@/lib/auth";
import Link from "next/link";

interface ThemePreset {
  name: string;
  primary: string;
  dark: string;
  light: string;
  class: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { name: "Xanh chàm (Mặc định)", primary: "#4f46e5", dark: "#3730a3", light: "#eef2ff", class: "indigo" },
  { name: "Xanh ngọc (Đại dương)", primary: "#0d9488", dark: "#0f766e", light: "#f0fdfa", class: "teal" },
  { name: "Hồng (Thời thượng)", primary: "#e11d48", dark: "#be123c", light: "#fff1f2", class: "rose" },
  { name: "Xanh lá (Tươi mát)", primary: "#10b981", dark: "#047857", light: "#ecfdf5", class: "emerald" },
  { name: "Hổ phách (Ấm áp)", primary: "#f59e0b", dark: "#b45309", light: "#fffbeb", class: "amber" },
  { name: "Xám đá (Tối giản)", primary: "#475569", dark: "#334155", light: "#f8fafc", class: "slate" },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "checkout" | "promo" | "theme">("general");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // General Settings States
  const [storeName, setStoreName] = useState("ThreadCraft");
  const [storeEmail, setStoreEmail] = useState("support@threadcraft.com");
  const [storePhone, setStorePhone] = useState("+1 (555) 123-4567");
  const [storeAddress, setStoreAddress] = useState("123 Fashion Ave, New York, NY 10001");
  const [supportHours, setSupportHours] = useState("Thứ 2 - Thứ 7, 9:00 - 18:00");
  const [storeDescription, setStoreDescription] = useState("Nền tảng thương mại điện tử thời trang Microservices hiện đại");

  // Checkout Settings States
  const [shippingFee, setShippingFee] = useState("10.00");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("100.00");
  const [taxRate, setTaxRate] = useState("5.0");

  // Promo Banner Settings States
  const [promoBannerEnabled, setPromoBannerEnabled] = useState(true);
  const [promoBannerText, setPromoBannerText] = useState("Miễn phí vận chuyển cho đơn hàng từ $100!");

  // Aesthetics & Theme States
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(THEME_PRESETS[0]);

  useEffect(() => {
    if (!isLoggedIn() || getRole() !== "ADMIN") {
      router.push("/");
      return;
    }

    // Load configurations from localStorage
    try {
      const stored = localStorage.getItem("store_settings");
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.storeName) setStoreName(settings.storeName);
        if (settings.storeEmail) setStoreEmail(settings.storeEmail);
        if (settings.storePhone) setStorePhone(settings.storePhone);
        if (settings.storeAddress) setStoreAddress(settings.storeAddress);
        if (settings.supportHours) setSupportHours(settings.supportHours);
        if (settings.storeDescription) setStoreDescription(settings.storeDescription);
        if (settings.shippingFee !== undefined) setShippingFee(settings.shippingFee.toString());
        if (settings.freeShippingThreshold !== undefined) setFreeShippingThreshold(settings.freeShippingThreshold.toString());
        if (settings.taxRate !== undefined) setTaxRate(settings.taxRate.toString());
        if (settings.promoBannerEnabled !== undefined) setPromoBannerEnabled(!!settings.promoBannerEnabled);
        if (settings.promoBannerText !== undefined) setPromoBannerText(settings.promoBannerText);
        
        if (settings.primaryColor) {
          const found = THEME_PRESETS.find(p => p.primary.toLowerCase() === settings.primaryColor.toLowerCase());
          if (found) {
            setSelectedTheme(found);
          } else {
            setSelectedTheme({
              name: "Custom",
              primary: settings.primaryColor,
              dark: settings.primaryColorDark || settings.primaryColor,
              light: settings.primaryColorLight || "#f1f5f9",
              class: "custom"
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleApplyTheme = (theme: ThemePreset) => {
    setSelectedTheme(theme);
    // Apply variables to document element on-the-fly for immediate feedback
    document.documentElement.style.setProperty("--primary", theme.primary);
    document.documentElement.style.setProperty("--primary-dark", theme.dark);
    document.documentElement.style.setProperty("--primary-light", theme.light);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const fee = parseFloat(shippingFee);
    const threshold = parseFloat(freeShippingThreshold);
    const tax = parseFloat(taxRate);

    if (isNaN(fee) || fee < 0) {
      setError("Phí vận chuyển mặc định phải là số hợp lệ không âm.");
      return;
    }
    if (isNaN(threshold) || threshold < 0) {
      setError("Mức miễn phí vận chuyển phải là số hợp lệ không âm.");
      return;
    }
    if (isNaN(tax) || tax < 0 || tax > 100) {
      setError("Thuế suất phải là tỷ lệ phần trăm hợp lệ từ 0 đến 100.");
      return;
    }

    try {
      const settings = {
        storeName,
        storeEmail,
        storePhone,
        storeAddress,
        supportHours,
        storeDescription,
        shippingFee: fee,
        freeShippingThreshold: threshold,
        taxRate: tax,
        promoBannerEnabled,
        promoBannerText,
        primaryColor: selectedTheme.primary,
        primaryColorDark: selectedTheme.dark,
        primaryColorLight: selectedTheme.light
      };

      localStorage.setItem("store_settings", JSON.stringify(settings));
      
      // Dispatch custom event so that components like Navbar and PromoBanner update instantly
      window.dispatchEvent(new Event("store_settings_updated"));
      
      setSuccess("Đã cập nhật và lưu cấu hình thành công!");
      
      // Auto-hide alert after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError("Lưu cấu hình thất bại: " + (err.message || "Lỗi không xác định"));
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h4 className="sidebar-title">Menu</h4>
          <div style={{ padding: "0 24px", color: "var(--text-light)" }}>Đang tải...</div>
        </aside>
        <main className="admin-content" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="spinner"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h4 className="sidebar-title">Menu</h4>
        <Link href="/admin" className="sidebar-link">
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
        <Link href="/admin/settings" className="sidebar-link active">
          ⚙️ Cài đặt
        </Link>
      </aside>

      <main className="admin-content">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1 className="page-title">Cấu hình hệ thống</h1>
              <p className="page-subtitle">Thiết lập thông tin cửa hàng, quy tắc thanh toán và giao diện</p>
            </div>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="settings-container">
            <div className="settings-tabs">
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
                onClick={() => setActiveTab("general")}
              >
                🏠 Thông tin chung
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "checkout" ? "active" : ""}`}
                onClick={() => setActiveTab("checkout")}
              >
                💳 Thanh toán
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "promo" ? "active" : ""}`}
                onClick={() => setActiveTab("promo")}
              >
                ✨ Banner quảng cáo
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "theme" ? "active" : ""}`}
                onClick={() => setActiveTab("theme")}
              >
                🎨 Giao diện
              </button>
            </div>

            <form onSubmit={handleSave} className="settings-form">
              <div className="tab-content">
                {activeTab === "general" && (
                  <div className="tab-pane">
                    <h3 className="tab-pane-title">Thông tin chung cửa hàng</h3>
                    <p className="tab-pane-desc">Các thiết lập cơ bản và thông tin liên hệ hiển thị trên trang bán hàng.</p>
                    
                    <div className="form-group">
                      <label className="form-label">Tên thương hiệu cửa hàng</label>
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        value={storeName} 
                        onChange={(e) => setStoreName(e.target.value)} 
                        placeholder="Ví dụ: ThreadCraft"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Email hỗ trợ khách hàng</label>
                        <input 
                          type="email" 
                          required 
                          className="form-input" 
                          value={storeEmail} 
                          onChange={(e) => setStoreEmail(e.target.value)}
                          placeholder="Ví dụ: support@threadcraft.com"
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Số điện thoại hỗ trợ</label>
                        <input 
                          type="text" 
                          required 
                          className="form-input" 
                          value={storePhone} 
                          onChange={(e) => setStorePhone(e.target.value)}
                          placeholder="Ví dụ: +84 123 456 789"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Địa chỉ cửa hàng</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={storeAddress} 
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="Địa chỉ trụ sở chính"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Giờ làm việc hỗ trợ</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={supportHours} 
                        onChange={(e) => setSupportHours(e.target.value)}
                        placeholder="Ví dụ: Thứ 2 - Thứ 7, 9:00 - 18:00"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mô tả cửa hàng / Khẩu hiệu</label>
                      <textarea 
                        className="form-input" 
                        style={{ minHeight: "80px", fontFamily: "inherit" }}
                        value={storeDescription} 
                        onChange={(e) => setStoreDescription(e.target.value)}
                        placeholder="Mô tả ngắn về cửa hàng thời trang của bạn..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === "checkout" && (
                  <div className="tab-pane">
                    <h3 className="tab-pane-title">Cấu hình thanh toán & Quy tắc</h3>
                    <p className="tab-pane-desc">Thiết lập phí vận chuyển, thuế suất và hạn mức áp dụng trong quá trình đặt hàng.</p>

                    <div className="form-group">
                      <label className="form-label">Phí vận chuyển mặc định ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        required 
                        className="form-input" 
                        value={shippingFee} 
                        onChange={(e) => setShippingFee(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Hạn mức miễn phí vận chuyển ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        required 
                        className="form-input" 
                        value={freeShippingThreshold} 
                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      />
                      <small style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                        Đơn hàng có tổng giá trị trên mức này sẽ được miễn phí giao hàng ($0.00).
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Thuế suất đơn hàng tiêu chuẩn (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="100" 
                        required 
                        className="form-input" 
                        value={taxRate} 
                        onChange={(e) => setTaxRate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "promo" && (
                  <div className="tab-pane">
                    <h3 className="tab-pane-title">Thông báo banner đầu trang</h3>
                    <p className="tab-pane-desc">Hiển thị một banner nổi bật trên toàn hệ thống để thông báo khuyến mãi, tin tức hoặc sự kiện.</p>

                    <div className="form-group toggle-group" style={{ flexDirection: "row", alignItems: "center", gap: "12px", background: "var(--surface-2)", padding: "16px", borderRadius: "var(--radius-sm)" }}>
                      <input 
                        type="checkbox" 
                        id="promoBannerEnabled"
                        style={{ width: "20px", height: "20px", cursor: "pointer" }}
                        checked={promoBannerEnabled} 
                        onChange={(e) => setPromoBannerEnabled(e.target.checked)}
                      />
                      <label htmlFor="promoBannerEnabled" style={{ fontWeight: 600, cursor: "pointer" }}>
                        Kích hoạt banner thông báo toàn trang
                      </label>
                    </div>

                    <div className="form-group" style={{ opacity: promoBannerEnabled ? 1 : 0.5, transition: "opacity var(--transition)" }}>
                      <label className="form-label">Nội dung thông báo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        disabled={!promoBannerEnabled}
                        value={promoBannerText} 
                        onChange={(e) => setPromoBannerText(e.target.value)}
                        placeholder="Ví dụ: Giảm ngay 20% khi nhập mã UUDAI20!"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "theme" && (
                  <div className="tab-pane">
                    <h3 className="tab-pane-title">Mỹ thuật trực quan & Chủ đề</h3>
                    <p className="tab-pane-desc">Chọn màu sắc thương hiệu chủ đạo để thay đổi các nút bấm, đầu trang, liên kết và các điểm nhấn trên toàn cửa hàng.</p>

                    <div className="presets-grid">
                      {THEME_PRESETS.map((theme) => (
                        <button
                          key={theme.name}
                          type="button"
                          className={`theme-card ${selectedTheme.primary === theme.primary ? "active" : ""}`}
                          onClick={() => handleApplyTheme(theme)}
                        >
                          <div className="color-circle" style={{ backgroundColor: theme.primary }}></div>
                          <span className="theme-name">{theme.name}</span>
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: "32px", padding: "20px", background: "var(--surface-2)", borderRadius: "var(--radius)" }}>
                      <h4 style={{ fontWeight: 600, marginBottom: "8px" }}>Khu vực xem trước trực tiếp</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>Xem chủ đề đã chọn ảnh hưởng như thế nào đến các thành phần UI:</p>
                      
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <button type="button" className="btn-primary" style={{ pointerEvents: "none" }}>Nút hành động chính</button>
                        <button type="button" className="btn-outline-sm" style={{ pointerEvents: "none", color: "var(--primary)", borderColor: "var(--primary)" }}>Nút viền phụ</button>
                        <span style={{ color: "var(--primary)", fontWeight: 600 }}>Đường dẫn liên kết văn bản</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ marginTop: "40px", display: "flex", gap: "12px" }}>
                <button type="submit" className="btn-primary" style={{ padding: "14px 40px" }}>
                  Lưu tất cả cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .settings-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          display: flex;
          min-height: 500px;
          overflow: hidden;
        }
        .settings-tabs {
          width: 220px;
          background: var(--surface-2);
          border-right: 1px solid var(--border);
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition);
        }
        .tab-btn:hover {
          background: var(--surface);
          color: var(--text);
        }
        .tab-btn.active {
          background: var(--surface);
          color: var(--primary);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }
        .settings-form {
          flex: 1;
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .tab-pane-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .tab-pane-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 32px;
        }
        .form-row {
          display: flex;
          gap: 20px;
        }
        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }
        .theme-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          border: 2px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          cursor: pointer;
          transition: all var(--transition);
        }
        .theme-card:hover {
          border-color: var(--text-muted);
          transform: translateY(-2px);
        }
        .theme-card.active {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .color-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin-bottom: 12px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05);
        }
        .theme-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
        }
        @media (max-width: 768px) {
          .settings-container {
            flex-direction: column;
          }
          .settings-tabs {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border);
            flex-direction: row;
            overflow-x: auto;
          }
          .settings-form {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
