"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductVariant } from "@/lib/api";
import { 
  CartItem, 
  getCart, 
  addToCart as rawAddToCart, 
  updateCartQuantity as rawUpdateCartQuantity, 
  clearCart as rawClearCart 
} from "@/lib/cart";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, qty: number) => void;
  removeFromCart: (productId: number, variantId: number) => void;
  updateQty: (productId: number, variantId: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const reloadCart = () => {
    setItems(getCart());
  };

  useEffect(() => {
    reloadCart();
    
    if (typeof window !== "undefined") {
      window.addEventListener("cart_updated", reloadCart);
      return () => {
        window.removeEventListener("cart_updated", reloadCart);
      };
    }
  }, []);

  const addToCart = (product: Product, variant: ProductVariant, qty: number) => {
    rawAddToCart({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantColor: variant.color,
      variantSize: variant.size,
      price: product.basePrice,
      imageUrl: product.imageUrl
    }, qty);
  };

  const removeFromCart = (productId: number, variantId: number) => {
    rawUpdateCartQuantity(productId, variantId, 0);
  };

  const updateQty = (productId: number, variantId: number, qty: number) => {
    rawUpdateCartQuantity(productId, variantId, qty);
  };

  const clearCart = () => {
    rawClearCart();
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
