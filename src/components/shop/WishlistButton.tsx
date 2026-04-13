"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function WishlistButton({ productId }: { productId: string }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      supabase.from("wishlists").select("id").eq("user_id", user.id).eq("product_id", productId).single()
        .then(({ data }) => setWishlisted(!!data));
    });
  }, [productId]);

  const toggle = async () => {
    if (!userId) { toast.error("Please sign in to save items"); return; }
    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId);
      setWishlisted(false);
      toast("Removed from wishlist");
      window.dispatchEvent(new Event("zarika-wishlist-update"));
    } else {
      await supabase.from("wishlists").insert({ user_id: userId, product_id: productId });
      setWishlisted(true);
      toast("Saved to wishlist ♡");
      window.dispatchEvent(new Event("zarika-wishlist-update"));
    }
  };

  return (
    <button onClick={toggle}
      style={{position:"absolute",top:"16px",right:"16px",width:"44px",height:"44px",borderRadius:"50%",background:"white",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.15)",zIndex:10,fontSize:"22px"}}
      title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}>
      {wishlisted ? "❤️" : "🤍"}
    </button>
  );
}
