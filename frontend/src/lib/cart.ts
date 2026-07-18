export interface CartItem {
  productId: number;
  variantId: number;
  productName: string;
  variantColor: string;
  variantSize: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("cart");
  if (!stored) return [];
  try {
    const raw = JSON.parse(stored);
    if (!Array.isArray(raw)) return [];

    let hasLegacy = false;
    const migrated = raw.map((item: any) => {
      // Check if item is in the legacy nested format: { product, variant, quantity }
      if (item && item.product && item.variant) {
        hasLegacy = true;
        return {
          productId: item.product.id,
          variantId: item.variant.id,
          productName: item.product.name,
          variantColor: item.variant.color,
          variantSize: item.variant.size,
          price: item.product.basePrice,
          quantity: item.quantity || 1,
          imageUrl: item.product.imageUrl
        };
      }
      return item;
    });

    // Filter out any corrupted items that don't have valid numerical IDs and prices
    const validated = migrated.filter((item: any) => 
      item && 
      typeof item.productId === "number" && 
      typeof item.variantId === "number" &&
      typeof item.price === "number" &&
      !isNaN(item.price)
    );

    if (hasLegacy || validated.length !== raw.length) {
      localStorage.setItem("cart", JSON.stringify(validated));
      // Dispatch update event so that context and other components sync up immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart_updated"));
      }
    }

    return validated;
  } catch (e) {
    console.error("Failed to parse cart:", e);
    return [];
  }
}

export function addToCart(item: Omit<CartItem, "quantity">, qty: number = 1) {
  const cart = getCart();
  const existing = cart.find(
    (c) => c.productId === item.productId && c.variantId === item.variantId
  );
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart_updated"));
  }
}

export function updateCartQuantity(productId: number, variantId: number, qty: number) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(c => !(c.productId === productId && c.variantId === variantId));
  } else {
    const item = cart.find(c => c.productId === productId && c.variantId === variantId);
    if (item) item.quantity = qty;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart_updated"));
  }
}

export function clearCart() {
  localStorage.removeItem("cart");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart_updated"));
  }
}
