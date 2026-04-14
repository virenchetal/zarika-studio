"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";

export function useCartSync() {
  const supabase = createClient();

  useEffect(() => {
    const syncCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cartItems } = await supabase
        .from("cart_items")
        .select("*, product:products(id, name, price, mrp, color, images:product_images(url, is_primary))")
        .eq("user_id", user.id);

      const localItems = useCartStore.getState().items;

      if (!cartItems || cartItems.length === 0) {
        // Push local cart to Supabase
        for (const item of localItems) {
          await supabase.from("cart_items").upsert({
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,product_id" });
        }
        return;
      }

      // Load Supabase cart into local store
      useCartStore.getState().clearCart();
      for (const ci of cartItems) {
        if (!ci.product) continue;
        const primaryImage = ci.product.images?.find((i: any) => i.is_primary) || ci.product.images?.[0];
        useCartStore.getState().addItem({
          id: ci.product_id,
          product_id: ci.product_id,
          name: ci.product.name,
          price: ci.product.price,
          mrp: ci.product.mrp || null,
          image: primaryImage?.url || null,
          color: ci.product.color || null,
        });
        const localItem = localItems.find(l => l.product_id === ci.product_id);
        const qty = localItem && localItem.quantity > ci.quantity ? localItem.quantity : ci.quantity;
        useCartStore.getState().updateQty(ci.product_id, qty);
      }

      // Push local-only items to Supabase
      for (const localItem of localItems) {
        if (!cartItems.find(ci => ci.product_id === localItem.product_id)) {
          useCartStore.getState().addItem({
            id: localItem.product_id,
            product_id: localItem.product_id,
            name: localItem.name,
            price: localItem.price,
            mrp: localItem.mrp,
            image: localItem.image,
            color: localItem.color,
          });
          await supabase.from("cart_items").upsert({
            user_id: user.id,
            product_id: localItem.product_id,
            quantity: localItem.quantity,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,product_id" });
        }
      }
    };

    syncCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") syncCart();
      if (event === "SIGNED_OUT") useCartStore.getState().clearCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncItemToSupabase = async (product_id: string, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (quantity <= 0) {
      await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", product_id);
    } else {
      await supabase.from("cart_items").upsert({
        user_id: user.id,
        product_id,
        quantity,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,product_id" });
    }
  };

  return { syncItemToSupabase };
}
