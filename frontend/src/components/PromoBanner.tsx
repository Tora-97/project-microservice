"use client";
import React, { useEffect, useState } from "react";

export default function PromoBanner() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");

  const updateBanner = () => {
    try {
      const stored = localStorage.getItem("store_settings");
      if (stored) {
        const settings = JSON.parse(stored);
        setEnabled(!!settings.promoBannerEnabled);
        setText(settings.promoBannerText || "");
      } else {
        setEnabled(false);
        setText("");
      }
    } catch (e) {
      console.error("Error reading store settings for banner:", e);
    }
  };

  useEffect(() => {
    updateBanner();
    window.addEventListener("store_settings_updated", updateBanner);
    return () => {
      window.removeEventListener("store_settings_updated", updateBanner);
    };
  }, []);

  if (!enabled || !text) return null;

  return (
    <div className="promo-banner">
      <div className="promo-banner-content">
        <span>✨ {text} ✨</span>
      </div>
    </div>
  );
}
