"use client";
import { useCartStore } from "@/lib/store/cart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

export default function CartDrawer({ open, onClose, onAuthRequired }: CartDrawerProps) {
  const { items, removeItem, updateQty, total, count } = useCartStore();

  const handleCheckout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { onAuthRequired(); return; }
    window.location.href = "/checkout";
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-[7000]" onClick={onClose} />}
      <div className={`fixed top-0 right-0 w-[420px] max-w-full h-screen bg-white z-[7001] flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <h2 className="font-serif text-xl font-light text-dark">
            Your Cart <span className="font-sans text-sm text-light font-normal">({count()} items)</span>
          </h2>
          <button onClick={onClose} className="text-light text-xl hover:text-dark">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-4xl mb-4">🛍</p>
              <p className="font-serif text-xl text-dark mb-2">Your cart is empty</p>
              <p className="text-sm text-light mb-6">Discover our beautiful saree collections</p>
              <a href="/shop" onClick={onClose}
                className="bg-gold text-charcoal px-8 py-3 text-xs tracking-widest uppercase">
                Shop Now
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border-light">
                  <div className="w-20 aspect-[3/4] rounded bg-cream2 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-maroon to-maroon-light" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-base font-medium text-dark mb-1">{item.name}</p>
                    <p className="text-xs text-light mb-2">{item.color}</p>
                    <p className="font-medium text-maroon">₹{item.price.toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 border border-border rounded text-sm hover:border-maroon hover:text-maroon transition-colors">−</button>
                      <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 border border-border rounded text-sm hover:border-maroon hover:text-maroon transition-colors">+</button>
                      <button onClick={() => removeItem(item.id)}
                        className="text-xs text-light ml-3 underline hover:text-red-600">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border-light">
            <div className="flex justify-between text-sm text-mid mb-2">
              <span>Subtotal</span><span>₹{total().toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-mid mb-3">
              <span>Shipping</span>
              <span className="text-green-700">{total() >= 2000 ? "Free" : "₹99"}</span>
            </div>
            <div className="flex justify-between font-serif text-lg text-dark font-medium border-t border-border-light pt-3 mb-4">
              <span>Total</span>
              <span className="text-maroon">₹{(total() + (total() >= 2000 ? 0 : 99)).toLocaleString("en-IN")}</span>
            </div>
            <button onClick={handleCheckout}
              className="w-full bg-maroon text-white py-4 text-xs tracking-widest uppercase hover:bg-maroon-light transition-colors">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
