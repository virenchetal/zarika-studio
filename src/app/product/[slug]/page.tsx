export const dynamic = "force-dynamic";

import { getProductBySlug } from "@/lib/api/products";
import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/shop/ProductImageGallery";
import ProductActions from "@/components/shop/ProductActions";
import WishlistButton from "@/components/shop/WishlistButton";
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
            <div style={{position:"relative"}}>
              <ProductImageGallery images={product.images || []} productName={product.name} />
              <WishlistButton productId={product.id} />
            </div>
            <div className="sticky top-20">
              <p className="text-[10px] tracking-[2px] uppercase text-gold mb-2">{product.category?.name}</p>
              <h1 className="font-serif text-4xl font-light text-dark leading-snug mb-5">{product.name}</h1>

              {/* Price card */}
              <div style={{background:"#FAF8F3",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"16px 20px",marginBottom:"24px"}}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-serif text-3xl text-maroon font-medium">₹{product.price.toLocaleString("en-IN")}</span>
                  {product.mrp && <span className="text-base text-light line-through">₹{product.mrp.toLocaleString("en-IN")}</span>}
                  {discount && <span className="text-sm text-green-700 font-medium bg-green-50 px-3 py-0.5 rounded-full">Save {discount}%</span>}
                </div>
                <p className="text-sm text-mid mt-2">🚚 Delivery in <strong className="text-dark">{product.delivery_days || "5–7 business days"}</strong></p>
              </div>

              {product.description && <p className="text-sm text-mid leading-relaxed mb-6" style={{lineHeight:"1.9"}}>{product.description}</p>}
              {/* Key product details */}
      {(product.fabric || product.color || product.occasion || product.length_meters || product.blouse_piece || product.care_instructions) && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"24px"}}>
          {[
            {label:"Fabric", value:product.fabric},
            {label:"Colour", value:product.color},
            {label:"Occasion", value:product.occasion},
            {label:"Length", value:product.length_meters ? product.length_meters+"m" : null},
            {label:"Blouse Piece", value:product.blouse_piece},
            {label:"Care", value:product.care_instructions},
          ].filter(d=>d.value).map(d=>(
            <div key={d.label} style={{padding:"10px 12px",background:"#FAF8F3",border:"1px solid #EDE6DC",borderRadius:"4px"}}>
              <div style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"3px"}}>{d.label}</div>
              <div style={{fontSize:"13px",color:"#2C2420",fontWeight:500}}>{d.value}</div>
            </div>
          ))}
        </div>
      )}
      <ProductActions product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
