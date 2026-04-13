"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import CartDrawer from "@/components/cart/CartDrawer";
import AuthModal from "@/components/auth/AuthModal";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const count = useCartStore((s) => s.count());
  const supabase = createClient();

  useEffect(() => {
    const fetchWishlistCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setWishlistCount(0); return; }
      const { count } = await supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      setWishlistCount(count || 0);
    };
    fetchWishlistCount();
    const handler = () => fetchWishlistCount();
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

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/#collections" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div style={{background:"#6B1A2A",color:"white",textAlign:"center",fontSize:"11px",padding:"9px 16px",letterSpacing:"0.5px",lineHeight:1.4}}>
        New Arrivals: <span style={{color:"#D4AF62",fontWeight:500}}>Kanjivaram Bridal Collection 2026</span>
        {" — "}Free shipping on orders above ₹2,000
      </div>

      <nav style={{background:"white",borderBottom:"1px solid #EDE6DC",position:"sticky",top:0,zIndex:200}}>

        {/* Search panel */}
        {searchOpen && (
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",borderBottom:"1px solid #EDE6DC",padding:"1rem 2rem",zIndex:300,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            <form onSubmit={handleSearch} style={{maxWidth:"560px",margin:"0 auto",display:"flex",gap:"8px"}}>
              <input ref={searchRef} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Search sarees, fabrics, occasions..."
                style={{flex:1,padding:"10px 16px",border:"1px solid #E4DAD0",borderRadius:"3px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",outline:"none",color:"#2C2420"}} />
              <button type="submit" style={{background:"#6B1A2A",color:"white",border:"none",padding:"10px 20px",borderRadius:"3px",fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Search</button>
              <button type="button" onClick={()=>{setSearchOpen(false);setSearchQuery("");}} style={{background:"none",border:"1px solid #E4DAD0",padding:"10px 12px",borderRadius:"3px",cursor:"pointer",color:"#A09890",fontSize:"14px"}}>✕</button>
            </form>
          </div>
        )}

        <div style={{maxWidth:"1280px",margin:"0 auto",padding:"0 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px"}}>

          {/* Logo */}
          <a href="/" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:600,letterSpacing:"3px",color:"#6B1A2A",textDecoration:"none",textTransform:"uppercase",lineHeight:1}}>
            Zarika<span style={{color:"#B8973C",fontWeight:300}}> Studio</span>
          </a>

          {/* Desktop nav */}
          <div style={{display:"flex",gap:"2.5rem",alignItems:"center"}} className="hidden md:flex">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#6B635C",textDecoration:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:400}}
                onMouseEnter={e=>(e.target as HTMLElement).style.color="#6B1A2A"}
                onMouseLeave={e=>(e.target as HTMLElement).style.color="#6B635C"}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Right icons */}
          <div style={{display:"flex",alignItems:"center",gap:"4px"}}>

            {/* Search */}
            <button onClick={()=>setSearchOpen(!searchOpen)}
              style={{background:"none",border:"none",cursor:"pointer",padding:"8px",color:"#2C2420",display:"flex",alignItems:"center",lineHeight:0}}
              onMouseEnter={e=>(e.currentTarget.style.color="#6B1A2A")}
              onMouseLeave={e=>(e.currentTarget.style.color="#2C2420")}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)}
              style={{background:"none",border:"none",cursor:"pointer",padding:"8px",color:"#2C2420",position:"relative",display:"flex",alignItems:"center",lineHeight:0}}
              onMouseEnter={e=>(e.currentTarget.style.color="#6B1A2A")}
              onMouseLeave={e=>(e.currentTarget.style.color="#2C2420")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {count > 0 && (
                <span style={{position:"absolute",top:"4px",right:"4px",background:"#B8973C",color:"white",fontSize:"9px",width:"15px",height:"15px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}}>
                  {count}
                </span>
              )}
            </button>

            {/* Account */}
            {user ? (
              <div style={{position:"relative"}} ref={dropdownRef}>
                <button onClick={()=>setDropdownOpen(!dropdownOpen)} style={{display:"flex",alignItems:"center",gap:"8px",background:"none",border:"none",cursor:"pointer",padding:"8px 4px",fontFamily:"'DM Sans',sans-serif"}}>
                  <div style={{width:"30px",height:"30px",borderRadius:"50%",background:"linear-gradient(135deg,#6B1A2A,#B8973C)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"12px",fontWeight:600,flexShrink:0}}>
                    {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span style={{fontSize:"12px",color:"#2C2420",fontFamily:"'DM Sans',sans-serif"}} className="hidden md:block">
                    {profile?.full_name?.split(" ")[0] || "Account"}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A09890" strokeWidth="2" className="hidden md:block">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div style={{position:"absolute",right:0,top:"calc(100% + 4px)",background:"white",border:"1px solid #EDE6DC",borderRadius:"4px",boxShadow:"0 8px 24px rgba(0,0,0,0.08)",minWidth:"180px",zIndex:50,paddingTop:"6px",paddingBottom:"6px",display:dropdownOpen?"block":"none"}}>
                  <div style={{padding:"10px 16px 8px",borderBottom:"1px solid #EDE6DC",marginBottom:"4px"}}>
                    <p style={{fontSize:"12px",fontWeight:600,color:"#2C2420",marginBottom:"2px"}}>{profile?.full_name || "My Account"}</p>
                    <p style={{fontSize:"11px",color:"#A09890"}}>{user?.email}</p>
                  </div>
                  {[
                    {label:"My Profile", href:"/profile"},
                    {label:"My Orders", href:"/profile#orders"},
                    {label:"My Wishlist", href:"/wishlist", badge: wishlistCount},
                  ].map(item=>(
                    <a key={item.label} href={item.href} onClick={()=>setDropdownOpen(false)}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 16px",fontSize:"13px",color:"#6B635C",textDecoration:"none"}}
                      onMouseEnter={e=>{(e.currentTarget.style.background="#FAF8F3");(e.currentTarget.style.color="#6B1A2A")}}
                      onMouseLeave={e=>{(e.currentTarget.style.background="none");(e.currentTarget.style.color="#6B635C")}}>
                      {item.label}
                      {item.badge ? <span style={{background:"#6B1A2A",color:"white",fontSize:"10px",padding:"1px 7px",borderRadius:"10px"}}>{item.badge}</span> : null}
                    </a>
                  ))}
                  {profile?.is_admin && (
                    <a href="/admin" style={{display:"block",padding:"9px 16px",fontSize:"13px",color:"#B8973C",fontWeight:500,textDecoration:"none"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="#FAF8F3")}
                      onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                      Admin Panel
                    </a>
                  )}
                  <div style={{borderTop:"1px solid #EDE6DC",marginTop:"4px",paddingTop:"4px"}}>
                    <button onClick={()=>{handleSignOut();setDropdownOpen(false);}}
                      style={{display:"block",width:"100%",textAlign:"left",padding:"9px 16px",fontSize:"13px",color:"#DC2626",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="#FEF2F2")}
                      onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)}
                style={{background:"#6B1A2A",color:"white",border:"none",padding:"8px 18px",fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",cursor:"pointer",borderRadius:"3px",fontFamily:"'DM Sans',sans-serif",marginLeft:"4px"}}
                className="hidden sm:block">
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{background:"none",border:"none",cursor:"pointer",padding:"8px",flexDirection:"column",gap:"5px",marginLeft:"4px"}}
              className="md:hidden">
              <div style={{width:"20px",height:"1.5px",background:"#2C2420"}}></div>
              <div style={{width:"20px",height:"1.5px",background:"#2C2420"}}></div>
              <div style={{width:"20px",height:"1.5px",background:"#2C2420"}}></div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{background:"white",borderTop:"1px solid #EDE6DC",padding:"1.5rem 2rem",display:"flex",flexDirection:"column",gap:"0"}}>
            {navLinks.map(link=>(
              <a key={link.label} href={link.href} onClick={()=>setMobileMenuOpen(false)}
                style={{padding:"12px 0",fontSize:"13px",color:"#2C2420",textDecoration:"none",borderBottom:"1px solid #EDE6DC",letterSpacing:"0.5px"}}>
                {link.label}
              </a>
            ))}
            {user ? (
              <>
                <a href="/profile" onClick={()=>setMobileMenuOpen(false)} style={{padding:"12px 0",fontSize:"13px",color:"#2C2420",textDecoration:"none",borderBottom:"1px solid #EDE6DC"}}>My Profile</a>
                <a href="/profile#orders" onClick={()=>setMobileMenuOpen(false)} style={{padding:"12px 0",fontSize:"13px",color:"#2C2420",textDecoration:"none",borderBottom:"1px solid #EDE6DC"}}>My Orders</a>
                <a href="/wishlist" onClick={()=>setMobileMenuOpen(false)} style={{padding:"12px 0",fontSize:"13px",color:"#2C2420",textDecoration:"none",borderBottom:"1px solid #EDE6DC"}}>My Wishlist</a>
                <button onClick={()=>{handleSignOut();setMobileMenuOpen(false);}} style={{padding:"12px 0",fontSize:"13px",color:"#DC2626",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",marginTop:"4px"}}>Sign Out</button>
              </>
            ) : (
              <button onClick={()=>{setAuthOpen(true);setMobileMenuOpen(false);}} style={{marginTop:"1rem",background:"#6B1A2A",color:"white",border:"none",padding:"12px",fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",cursor:"pointer",borderRadius:"3px",fontFamily:"'DM Sans',sans-serif"}}>Sign In</button>
            )}
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onAuthRequired={() => { setCartOpen(false); setAuthOpen(true); }} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
