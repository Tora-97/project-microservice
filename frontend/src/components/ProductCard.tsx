import Link from "next/link";
import { Product } from "@/lib/api";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const colors = [...new Set(product.variants?.map((v) => v.color) || [])];
  const sizes = [...new Set(product.variants?.map((v) => v.size) || [])];
  const inStock =
    product.variants?.some((v) => v.stockQuantity > 0) ?? true;

  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <div className="product-img-wrap">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="product-img-placeholder">
            <span>👕</span>
          </div>
        )}
        {!inStock && <span className="badge-out-stock">Hết hàng</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-meta">
          {colors.length > 0 && (
            <span className="product-variants">{colors.join(", ")}</span>
          )}
          {sizes.length > 0 && (
            <span className="product-sizes">{sizes.join(" · ")}</span>
          )}
        </div>
        <div className="product-footer">
          <span className="product-price">
            ${product.basePrice.toFixed(2)}
          </span>
          <span className="product-view-btn">Chi tiết →</span>
        </div>
      </div>
    </Link>
  );
}
