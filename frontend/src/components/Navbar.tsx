"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { clearAuth, getEmail, isLoggedIn, getRole } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
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
      console.error("Error updating store name in navbar:", e);
    }
  };

  const updateAuth = () => {
    setLoggedIn(isLoggedIn());
    setEmail(getEmail() || "");
    setRole(getRole() || "");
  };

  useEffect(() => {
    updateAuth();
    updateStoreName();

    window.addEventListener("store_settings_updated", updateStoreName);
    window.addEventListener("auth_changed", updateAuth);
    return () => {
      window.removeEventListener("store_settings_updated", updateStoreName);
      window.removeEventListener("auth_changed", updateAuth);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <span>{storeName}</span>
        </Link>

        <div className="navbar-links">
          <Link href="/products">Sản phẩm</Link>
          {role === "ADMIN" && <Link href="/admin">Quản trị</Link>}
          {loggedIn && <Link href="/orders">Đơn hàng của tôi</Link>}
        </div>



        <div className="navbar-actions">
          <Link href="/cart" className="cart-btn">
            🛒
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          {loggedIn ? (
            <div className="user-menu">
              <span className="user-email">{email}</span>
              <button onClick={handleLogout} className="btn-outline-sm">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link href="/auth/login" className="btn-outline-sm">Đăng nhập</Link>
              <Link href="/auth/register" className="btn-primary-sm">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
