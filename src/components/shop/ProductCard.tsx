"use client";
import Image from "next/image";
import { Product } from "@/types/database";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp || null,
      image: primaryImage?.url || null,
      color: product.color || null,
    });
    toast.success(`Added — ${product.name}`);
  };

  return (
    <a href={`/product/${product.slug}`}
      className="group bg-white border border-border-light rounded overflow-hidden hover:border-gold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 relative block">

      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden relative bg-cream2">
        {primaryImage ? (
          <Image src={primaryImage.url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full swatch-s${Math.ceil(Math.random() * 8)}`} />
        )}

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[9px] tracking-widest uppercase px-2.5 py-1 font-medium ${
            product.badge === "new" ? "bg-gold text-white" :
            product.badge === "sale" ? "bg-maroon text-white" :
            "bg-charcoal text-gold-light"
          }`}>
            {product.badge}
          </span>
        )}

        {/* Quick Add */}
        <button onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-maroon text-white py-3 text-[11px] tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium">
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-serif text-[17px] font-medium text-dark mb-1 leading-snug">{product.name}</h3>
        <p className="text-[11px] text-light uppercase tracking-wide mb-2.5">{product.fabric} · {product.color?.split(" ")[0]}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[19px] text-maroon font-medium">₹{product.price.toLocaleString("en-IN")}</span>
          {product.mrp && <span className="text-xs text-light line-through">₹{product.mrp.toLocaleString("en-IN")}</span>}
          {discount && <span className="text-[11px] text-green-700 font-medium">{discount}% off</span>}
        </div>
      </div>
    </a>
  );
}
