"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import CartDrawer from "@/components/cart/CartDrawer";
import AuthModal from "@/components/auth/AuthModal";
import { useEffect, useRef } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const wl = JSON.parse(localStorage.getItem("zarika-wishlist") || "[]");
    setWishlistCount(wl.length);
    const handler = () => {
      const wl2 = JSON.parse(localStorage.getItem("zarika-wishlist") || "[]");
      setWishlistCount(wl2.length);
    };
    window.addEventListener("zarika-wishlist-update", handler);
    return () => window.removeEventListener("zarika-wishlist-update", handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery("");
    }
  };
  const count = useCartStore((s) => s.count());
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from("profiles").select("*").eq("id", data.user.id).single()
          .then(({ data: p }) => setProfile(p));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/";
  };

  return (
    <>
      <div className="bg-maroon text-white text-center text-xs py-2.5 tracking-wide overflow-hidden px-4">
        New Arrivals: <span className="text-gold-light font-medium">Kanjivaram Bridal Collection 2026</span>
        {" — "}Free shipping on orders above ₹2,000
      </div>

      <nav className="bg-white border-b border-border-light sticky top-0 z-[200]">
      {searchOpen && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",borderBottom:"1px solid #EDE6DC",padding:"1rem 2rem",zIndex:300,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
          <form onSubmit={handleSearch} style={{maxWidth:"600px",margin:"0 auto",display:"flex",gap:"10px"}}>
            <input ref={searchRef} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              placeholder="Search sarees, fabrics, occasions..."
              style={{flex:1,padding:"10px 16px",border:"1px solid #E4DAD0",borderRadius:"4px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",outline:"none"}} />
            <button type="submit" style={{background:"#6B1A2A",color:"white",border:"none",padding:"10px 20px",borderRadius:"4px",fontSize:"12px",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer"}}>Search</button>
            <button type="button" onClick={()=>setSearchOpen(false)} style={{background:"none",border:"1px solid #E4DAD0",padding:"10px 14px",borderRadius:"4px",cursor:"pointer",color:"#A09890"}}>✕</button>
          </form>
        </div>
      )}
        <div className="max-w-[1280px] mx-auto px-4 md:px-4 md:px-10 flex items-center justify-between h-14 md:h-16">
          <a href="/" className="font-serif text-xl font-semibold tracking-[3px] text-maroon uppercase">
            Zarika<span className="text-gold font-light"> Studio</span>
          </a>

          <div className="hidden md:flex gap-10 items-center">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: "Collections", href: "/#collections" },
              { label: "New Arrivals", href: "/shop?sort=newest" },
            ].map((link) => (
              <a key={link.label} href={link.href}
                className="text-[11px] tracking-widest uppercase text-mid hover:text-maroon transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <button className="md:hidden p-2 text-dark" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
        <div className="w-5 h-0.5 bg-current mb-1"></div>
        <div className="w-5 h-0.5 bg-current mb-1"></div>
        <div className="w-5 h-0.5 bg-current"></div>
      </button>
      <div className="flex items-center gap-3">
            <button onClick={()=>setSearchOpen(!searchOpen)} className="text-dark hover:text-maroon text-lg p-1" aria-label="Search">🔍</button>
            <a href="/wishlist" className="relative text-dark hover:text-maroon text-lg p-1" aria-label="Wishlist">
              ♡
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-maroon text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-medium">{wishlistCount}</span>
              )}
            </a>

            <button onClick={() => setCartOpen(true)}
              className="relative text-dark hover:text-maroon text-lg p-1">
              🛍
              {count > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-gold text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </button>

            {user ? (
            <div className="relative group">
                <button className="flex items-center gap-2 bg-cream2 border border-border text-dark text-xs px-3 py-1.5 rounded-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {profile?.full_name?.split(" ")[0] || "Account"}
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-border-light rounded shadow-lg py-1 min-w-[160px] hidden group-hover:block z-50" style={{paddingTop:"8px",marginTop:"-4px"}}>
                  <a href="/profile" className="block px-4 py-2.5 text-sm text-mid hover:bg-cream hover:text-maroon">My Profile</a>
                  <a href="/profile#orders" className="block px-4 py-2.5 text-sm text-mid hover:bg-cream hover:text-maroon">My Orders</a>
                  <a href="/profile#wishlist" className="block px-4 py-2.5 text-sm text-mid hover:bg-cream hover:text-maroon">Wishlist</a>
                  {profile?.is_admin && (
                    <a href="/admin" className="block px-4 py-2.5 text-sm text-gold font-medium hover:bg-cream">Admin Panel</a>
                  )}
                  <hr className="my-1 border-border-light" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-cream">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)}
                className="hidden sm:block text-[10px] tracking-widest uppercase text-maroon border border-maroon px-3 py-1 rounded-sm hover:bg-maroon hover:text-white transition-all">
                Sign In
              </button>
            )}
          </div>
        </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border-light px-6 py-4 flex flex-col gap-4 overflow-hidden w-full">
          <a href="/shop" className="text-sm text-dark hover:text-maroon" onClick={() => setMobileMenuOpen(false)}>Shop</a>
          <a href="/collections" className="text-sm text-dark hover:text-maroon" onClick={() => setMobileMenuOpen(false)}>Collections</a>
          <a href="/shop?sort=newest" className="text-sm text-dark hover:text-maroon" onClick={() => setMobileMenuOpen(false)}>New Arrivals</a>
          {user ? (
            <>
              <a href="/profile" className="text-sm text-dark hover:text-maroon" onClick={() => setMobileMenuOpen(false)}>My Profile</a>
              <a href="/profile#orders" className="text-sm text-dark hover:text-maroon" onClick={() => setMobileMenuOpen(false)}>My Orders</a>
              <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="text-sm text-red-600 text-left">Sign Out</button>
            </>
          ) : (
            <button onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }} className="text-sm text-maroon font-medium text-left">Sign In</button>
          )}
        </div>
      )}
</nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onAuthRequired={() => { setCartOpen(false); setAuthOpen(true); }} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
