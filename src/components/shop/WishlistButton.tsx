"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function WishlistButton({ productId }: { productId: string }) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("zarika-wishlist") || "[]");
    setWishlisted(ids.includes(productId));
  }, [productId]);

  const toggle = () => {
    const ids: string[] = JSON.parse(localStorage.getItem("zarika-wishlist") || "[]");
    const updated = wishlisted ? ids.filter((i: string) => i !== productId) : [...ids, productId];
    localStorage.setItem("zarika-wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("zarika-wishlist-update"));
    setWishlisted(!wishlisted);
    toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist ♡");
  };

  return (
    <button onClick={toggle}
      style={{position:"absolute",top:"16px",right:"16px",width:"44px",height:"44px",borderRadius:"50%",background:"white",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.15)",zIndex:10,fontSize:"22px"}}
      title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}>
      {wishlisted ? "❤️" : "🤍"}
    </button>
  );
}