export const dynamic = "force-dynamic";

import { getProductBySlug } from "@/lib/api/products";
import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/shop/ProductImageGallery";
import ProductActions from "@/components/shop/ProductActions";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : null;

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-4 md:px-10 py-12">
          <div className="flex items-center gap-2 text-xs text-mid mb-8">
            <a href="/" className="hover:text-maroon">Home</a> › 
            <a href="/shop" className="hover:text-maroon">Sarees</a> › 
            <span className="text-light">{product.name}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-start">
            <ProductImageGallery images={product.images || []} productName={product.name} />
            <div className="sticky top-20">
              <p className="text-[10px] tracking-[2px] uppercase text-gold mb-3">{product.category?.name}</p>
              <h1 className="font-serif text-4xl font-light text-dark leading-snug mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3 mb-4 flex-wrap">
                <span className="font-serif text-3xl text-maroon font-medium">₹{product.price.toLocaleString("en-IN")}</span>
                {product.mrp && <span className="text-base text-light line-through">₹{product.mrp.toLocaleString("en-IN")}</span>}
                {discount && <span className="text-sm text-green-700 font-medium bg-green-50 px-3 py-0.5 rounded-full">Save {discount}%</span>}
              </div>
              <p className="text-sm text-mid mb-6">🚚 Delivery in <strong className="text-dark">{product.delivery_days || "5–7 business days"}</strong></p>
              <hr className="border-gray-100 my-6" />
              {product.description && <p className="text-sm text-mid leading-relaxed mb-6">{product.description}</p>}
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
