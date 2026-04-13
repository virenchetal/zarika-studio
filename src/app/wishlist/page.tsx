"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const ids: string[] = JSON.parse(localStorage.getItem("zarika-wishlist") || "[]");
    if (ids.length === 0) { setLoading(false); return; }
    supabase.from("products").select("id, name, slug, price, mrp, fabric, color, images").in("id", ids)
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  const removeFromWishlist = (id: string) => {
    const ids: string[] = JSON.parse(localStorage.getItem("zarika-wishlist") || "[]");
    const updated = ids.filter(i => i !== id);
    localStorage.setItem("zarika-wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("zarika-wishlist-update"));
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <>
      <Navbar />
      <div style={{background:"#FAF8F3",minHeight:"70vh",padding:"3rem 1.5rem"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <p style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#B8973C",marginBottom:"8px"}}>Saved Items</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"40px",fontWeight:400,color:"#2C2420",marginBottom:"2rem"}}>My Wishlist {items.length > 0 && <span style={{fontSize:"20px",color:"#A09890"}}>({items.length})</span>}</h1>
          {loading ? (
            <p style={{color:"#A09890",fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",padding:"4rem",textAlign:"center"}}>Loading your wishlist...</p>
          ) : items.length === 0 ? (
            <div style={{textAlign:"center",padding:"4rem 2rem"}}>
              <p style={{fontSize:"48px",marginBottom:"1rem"}}>♡</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",color:"#2C2420",marginBottom:"8px"}}>Your wishlist is empty</p>
              <p style={{fontSize:"14px",color:"#A09890",marginBottom:"1.5rem"}}>Save sarees you love and come back to them anytime</p>
              <a href="/shop" style={{background:"#6B1A2A",color:"white",padding:"12px 28px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none",borderRadius:"3px"}}>Browse Sarees</a>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"1.5rem"}}>
              {items.map(p => {
                const img = p.images?.find((i:any)=>i.is_primary)||p.images?.[0];
                const discount = p.mrp ? Math.round(((p.mrp-p.price)/p.mrp)*100) : null;
                return (
                  <div key={p.id} style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",overflow:"hidden"}}>
                    <a href={"/product/"+p.slug} style={{display:"block",aspectRatio:"3/4",background:"linear-gradient(145deg,#8B1A35,#C4416A)",textDecoration:"none",overflow:"hidden"}}>
                      {img && <img src={img.url} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                    </a>
                    <div style={{padding:"1rem"}}>
                      <p style={{fontSize:"11px",color:"#A09890",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"4px"}}>{p.fabric}</p>
                      <a href={"/product/"+p.slug} style={{fontSize:"16px",fontWeight:500,color:"#2C2420",textDecoration:"none",display:"block",marginBottom:"8px"}}>{p.name}</a>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",color:"#6B1A2A"}}>₹{p.price.toLocaleString("en-IN")}</span>
                        {p.mrp && <span style={{fontSize:"12px",color:"#A09890",textDecoration:"line-through"}}>₹{p.mrp.toLocaleString("en-IN")}</span>}
                        {discount && <span style={{fontSize:"11px",color:"#2D8A3E",fontWeight:500}}>{discount}% off</span>}
                      </div>
                      <div style={{display:"flex",gap:"8px"}}>
                        <a href={"/product/"+p.slug} style={{flex:1,background:"#6B1A2A",color:"white",padding:"10px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",textDecoration:"none",borderRadius:"3px",textAlign:"center"}}>View</a>
                        <button onClick={()=>removeFromWishlist(p.id)} style={{padding:"10px 14px",border:"1px solid #FCA5A5",borderRadius:"3px",background:"none",color:"#DC2626",cursor:"pointer",fontSize:"12px"}}>✕</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}