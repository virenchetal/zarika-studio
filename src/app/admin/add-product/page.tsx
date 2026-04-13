"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const INPUT = { width:"100%", padding:"10px 12px", border:"1px solid #E4DAD0", borderRadius:"4px", fontSize:"13px", background:"#FAF8F3", fontFamily:"'DM Sans',sans-serif", color:"#2C2420", boxSizing:"border-box" as const };
const LABEL = { fontSize:"11px", letterSpacing:"1.2px", textTransform:"uppercase" as const, color:"#A09890", marginBottom:"6px", display:"block" };
const SECTION = { background:"white", border:"1px solid #EDE6DC", borderRadius:"6px", padding:"1.5rem", marginBottom:"1.5rem" };

export default function AddProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", mrp: "",
    fabric: "", color: "", occasion: "", length_meters: "6.3",
    blouse_piece: "Included", care_instructions: "Dry clean only",
    stock_quantity: "10", sku: "", category_id: "",
    is_active: true, is_featured: false, badge: "", delivery_days: "5-7",
  });

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data: p } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!p?.is_admin) { router.push("/"); return; }
      const { data: cats } = await supabase.from("categories").select("id, name").order("name");
      setCategories(cats || []);
    }
    check();
  }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.name || !form.price || !form.stock_quantity) { setError("Name, Price and Stock are required."); return; }
    setSaving(true);
    const slug = form.slug || autoSlug(form.name);
    const payload: any = {
      name: form.name.trim(), slug,
      description: form.description || null,
      price: parseFloat(form.price),
      mrp: form.mrp ? parseFloat(form.mrp) : null,
      fabric: form.fabric || null, color: form.color || null,
      occasion: form.occasion || null,
      length_meters: form.length_meters ? parseFloat(form.length_meters) : null,
      blouse_piece: form.blouse_piece || null,
      care_instructions: form.care_instructions || null,
      stock_quantity: parseInt(form.stock_quantity),
      sku: form.sku || null,
      category_id: form.category_id || null,
      is_active: form.is_active, is_featured: form.is_featured,
      badge: form.badge || null, delivery_days: form.delivery_days || null,
    };
    const { error: err } = await supabase.from("products").insert(payload);
    setSaving(false);
    if (err) { setError("Error: " + err.message); return; }
    setSuccess("Product added successfully!");
    setTimeout(() => router.push("/admin"), 1500);
  };

  return (
    <div style={{minHeight:"100vh",background:"#FAF8F3"}}>
      {/* Top bar */}
      <div style={{background:"#1A1614",padding:"12px 2rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",color:"#FAF8F3",letterSpacing:"2px"}}>ZARIKA <span style={{color:"#B8973C"}}>ADMIN</span></span>
        <a href="/admin" style={{color:"rgba(255,255,255,0.5)",fontSize:"12px",textDecoration:"none"}}>← Back to Dashboard</a>
      </div>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"2.5rem 1.5rem"}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:400,color:"#2C2420",marginBottom:"2rem"}}>Add New Product</h1>

        {error && <div style={{background:"#FEE2E2",color:"#991B1B",padding:"12px 16px",borderRadius:"4px",marginBottom:"1rem",fontSize:"13px"}}>{error}</div>}
        {success && <div style={{background:"#D1FAE5",color:"#065F46",padding:"12px 16px",borderRadius:"4px",marginBottom:"1rem",fontSize:"13px"}}>{success}</div>}

        {/* Basic Info */}
        <div style={SECTION}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>Basic Information</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={LABEL}>Product Name *</label>
              <input style={INPUT} value={form.name} onChange={e=>{set("name",e.target.value);set("slug",autoSlug(e.target.value));}} placeholder="e.g. Kanjivaram Heritage Crimson" />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={LABEL}>Slug (auto-generated)</label>
              <input style={{...INPUT,color:"#A09890"}} value={form.slug} onChange={e=>set("slug",e.target.value)} placeholder="kanjivaram-heritage-crimson" />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={LABEL}>Description</label>
              <textarea style={{...INPUT,minHeight:"90px",resize:"vertical"}} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the saree — weave, heritage, drape..." />
            </div>
            <div>
              <label style={LABEL}>Category</label>
              <select style={INPUT} value={form.category_id} onChange={e=>set("category_id",e.target.value)}>
                <option value="">— Select Category —</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Badge (optional)</label>
              <input style={INPUT} value={form.badge} onChange={e=>set("badge",e.target.value)} placeholder="e.g. Bestseller, New, Limited" />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div style={SECTION}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>Pricing & Stock</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem"}}>
            <div>
              <label style={LABEL}>Selling Price (₹) *</label>
              <input style={INPUT} type="number" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="8999" />
            </div>
            <div>
              <label style={LABEL}>MRP (₹)</label>
              <input style={INPUT} type="number" value={form.mrp} onChange={e=>set("mrp",e.target.value)} placeholder="12000" />
            </div>
            <div>
              <label style={LABEL}>Stock Quantity *</label>
              <input style={INPUT} type="number" value={form.stock_quantity} onChange={e=>set("stock_quantity",e.target.value)} placeholder="10" />
            </div>
            <div>
              <label style={LABEL}>SKU</label>
              <input style={INPUT} value={form.sku} onChange={e=>set("sku",e.target.value)} placeholder="ZS-KAN-001" />
            </div>
            <div>
              <label style={LABEL}>Delivery Days</label>
              <input style={INPUT} value={form.delivery_days} onChange={e=>set("delivery_days",e.target.value)} placeholder="5-7" />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div style={SECTION}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>Product Details</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
            <div>
              <label style={LABEL}>Fabric</label>
              <input style={INPUT} value={form.fabric} onChange={e=>set("fabric",e.target.value)} placeholder="e.g. Pure Kanjivaram Silk" />
            </div>
            <div>
              <label style={LABEL}>Color</label>
              <input style={INPUT} value={form.color} onChange={e=>set("color",e.target.value)} placeholder="e.g. Deep Crimson" />
            </div>
            <div>
              <label style={LABEL}>Occasion</label>
              <input style={INPUT} value={form.occasion} onChange={e=>set("occasion",e.target.value)} placeholder="e.g. Wedding, Festive" />
            </div>
            <div>
              <label style={LABEL}>Length (meters)</label>
              <input style={INPUT} type="number" step="0.1" value={form.length_meters} onChange={e=>set("length_meters",e.target.value)} placeholder="6.3" />
            </div>
            <div>
              <label style={LABEL}>Blouse Piece</label>
              <select style={INPUT} value={form.blouse_piece} onChange={e=>set("blouse_piece",e.target.value)}>
                <option>Included</option>
                <option>Not Included</option>
                <option>Optional</option>
              </select>
            </div>
            <div>
              <label style={LABEL}>Care Instructions</label>
              <input style={INPUT} value={form.care_instructions} onChange={e=>set("care_instructions",e.target.value)} placeholder="Dry clean only" />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div style={SECTION}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>Visibility</h3>
          <div style={{display:"flex",gap:"2rem"}}>
            <label style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"13px",color:"#2C2420",cursor:"pointer"}}>
              <input type="checkbox" checked={form.is_active} onChange={e=>set("is_active",e.target.checked)} style={{width:"16px",height:"16px",accentColor:"#6B1A2A"}} />
              Active (visible on store)
            </label>
            <label style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"13px",color:"#2C2420",cursor:"pointer"}}>
              <input type="checkbox" checked={form.is_featured} onChange={e=>set("is_featured",e.target.checked)} style={{width:"16px",height:"16px",accentColor:"#6B1A2A"}} />
              Featured (show on homepage)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:"12px",justifyContent:"flex-end"}}>
          <a href="/admin" style={{padding:"12px 24px",border:"1px solid #E4DAD0",borderRadius:"4px",fontSize:"12px",color:"#6B635C",textDecoration:"none",letterSpacing:"1px",textTransform:"uppercase"}}>Cancel</a>
          <button onClick={handleSubmit} disabled={saving} style={{background:saving?"#A09890":"#6B1A2A",color:"white",padding:"12px 32px",borderRadius:"4px",fontSize:"12px",letterSpacing:"1px",textTransform:"uppercase",border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {saving ? "Saving..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
