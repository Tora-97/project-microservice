"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const res = await getProducts(q);
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch search results", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [q]);

  return (
    <div className="container">
      <h1 className="page-title">Kết quả tìm kiếm cho "{q}"</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p>Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Đang tải kết quả tìm kiếm...</div>}>
      <SearchResults />
    </Suspense>
  );
}
