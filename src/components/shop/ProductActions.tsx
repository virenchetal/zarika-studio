"use client";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/types/database";
import toast from "react-hot-toast";

export default function ProductActions({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];

  const handleAddToCart = () => {
    if (product.stock_quantity === 0) { toast.error("This item is out of stock"); return; }
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp || null,
      image: primaryImage?.url || null,
      color: product.color || null,
    });
    toast.success(`Added to cart — ${product.name}`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi! I'm interested in: ${product.name} (₹${product.price.toLocaleString("en-IN")})\n\nPage: ${window.location.href}`);
    window.open(`https://wa.me/919876500000?text=${msg}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-3">
      <button onClick={handleBuyNow}
        disabled={product.stock_quantity === 0}
        className="w-full bg-maroon text-white py-4 text-[11px] tracking-[2px] uppercase font-medium hover:bg-maroon-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {product.stock_quantity === 0 ? "Out of Stock" : "Buy Now"}
      </button>
      <button onClick={handleAddToCart}
        disabled={product.stock_quantity === 0}
        className="w-full border-[1.5px] border-maroon text-maroon py-4 text-[11px] tracking-[2px] uppercase font-medium hover:bg-maroon-pale transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        Add to Cart
      </button>
      <button onClick={handleWhatsApp}
        className="w-full py-3.5 text-[11px] tracking-[1.5px] uppercase font-medium flex items-center justify-center gap-2 text-white"
        style={{ background: "#25D366" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Inquire on WhatsApp
      </button>
    </div>
  );
}
