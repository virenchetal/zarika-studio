"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProductImageUploader from "@/components/admin/ProductImageUploader";
import { useRouter, useParams } from "next/navigation";

const INPUT = { width:"100%", padding:"10px 12px", border:"1px solid #E4DAD0", borderRadius:"4px", fontSize:"13px", background:"#FAF8F3", fontFamily:"'DM Sans',sans-serif", color:"#2C2420", boxSizing:"border-box" as const };
const LABEL = { fontSize:"11px", letterSpacing:"1.2px", textTransform:"uppercase" as const, color:"#A09890", marginBottom:"6px", display:"block" };
const SECTION = { background:"white", border:"1px solid #EDE6DC", borderRadius:"6px", padding:"1.5rem", marginBottom:"1.5rem" };

export default function EditProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<any>({
    name:"", slug:"", description:"", price:"", mrp:"",
    fabric:"", color:"", occasion:"", length_meters:"",
    blouse_piece:"Included", care_instructions:"", stock_quantity:"",
    sku:"", category_id:"", is_active:true, is_featured:false,
    badge:"", delivery_days:"",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data: p } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!p?.is_admin) { router.push("/"); return; }
      const [{ data: cats }, { data: product }] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("products").select("*").eq("id", id).single(),
      ]);
      setCategories(cats || []);
      if (product) {
        setForm({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          mrp: product.mrp?.toString() || "",
          fabric: product.fabric || "",
          color: product.color || "",
          occasion: product.occasion || "",
          length_meters: product.length_meters?.toString() || "",
          blouse_piece: product.blouse_piece || "Included",
          care_instructions: product.care_instructions || "",
          stock_quantity: product.stock_quantity?.toString() || "",
          sku: product.sku || "",
          category_id: product.category_id || "",
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
          badge: product.badge || "",
          delivery_days: product.delivery_days || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.name || !form.price || !form.stock_quantity) { setError("Name, Price and Stock are required."); return; }
    setSaving(true);
    const { error: err } = await supabase.from("products").update({
      name: form.name.trim(), slug: form.slug.trim(),
      description: form.description || null,
      price: parseFloat(form.price),
      mrp: form.mrp ? parseFloat(form.mrp) : null,
      fabric: form.fabric || null, color: form.color || null,
      occasion: form.occasion || null,
      length_meters: form.length_meters ? parseFloat(form.length_meters) : null,
      blouse_piece: form.blouse_piece || null,
      care_instructions: form.care_instructions || null,
      stock_quantity: parseInt(form.stock_quantity),
      sku: form.sku || null, category_id: form.category_id || null,
      is_active: form.is_active, is_featured: form.is_featured,
      badge: form.badge || null, delivery_days: form.delivery_days || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setSaving(false);
    if (err) { setError("Error: " + err.message); return; }
    setSuccess("Product updated successfully!");
    setTimeout(() => router.push("/admin"), 1500);
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#FAF8F3",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",color:"#2C2420"}}>Loading product...</p>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#FAF8F3"}}>
      <div style={{background:"#1A1614",padding:"12px 2rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",color:"#FAF8F3",letterSpacing:"2px"}}>ZARIKA <span style={{color:"#B8973C"}}>ADMIN</span></span>
        <a href="/admin" style={{color:"rgba(255,255,255,0.5)",fontSize:"12px",textDecoration:"none"}}>← Back to Dashboard</a>
      </div>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"2.5rem 1.5rem"}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:400,color:"#2C2420",marginBottom:"0.5rem"}}>Edit Product</h1>
        <p style={{fontSize:"13px",color:"#A09890",marginBottom:"2rem"}}>{form.name}</p>

        {error && <div style={{background:"#FEE2E2",color:"#991B1B",padding:"12px 16px",borderRadius:"4px",marginBottom:"1rem",fontSize:"13px"}}>{error}</div>}
        {success && <div style={{background:"#D1FAE5",color:"#065F46",padding:"12px 16px",borderRadius:"4px",marginBottom:"1rem",fontSize:"13px"}}>{success}</div>}

        {/* Quick Update — ops team uses this most */}
        <div style={{...SECTION, borderTop:"3px solid #B8973C"}}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>⚡ Quick Update</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem"}}>
            <div>
              <label style={LABEL}>Stock Quantity *</label>
              <input style={{...INPUT,fontSize:"20px",fontWeight:"600",color:"#2C2420",padding:"12px"}} type="number" value={form.stock_quantity} onChange={e=>set("stock_quantity",e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>Selling Price (₹) *</label>
              <input style={{...INPUT,fontSize:"20px",fontWeight:"600",color:"#6B1A2A",padding:"12px"}} type="number" value={form.price} onChange={e=>set("price",e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>MRP (₹)</label>
              <input style={{...INPUT,fontSize:"20px",padding:"12px"}} type="number" value={form.mrp} onChange={e=>set("mrp",e.target.value)} />
            </div>
          </div>
          <div style={{display:"flex",gap:"2rem",marginTop:"1rem"}}>
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

        {/* Basic Info */}
        <div style={SECTION}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>Basic Information</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={LABEL}>Product Name *</label>
              <input style={INPUT} value={form.name} onChange={e=>set("name",e.target.value)} />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={LABEL}>Slug</label>
              <input style={{...INPUT,color:"#A09890"}} value={form.slug} onChange={e=>set("slug",e.target.value)} />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={LABEL}>Description</label>
              <textarea style={{...INPUT,minHeight:"90px",resize:"vertical"}} value={form.description} onChange={e=>set("description",e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>Category</label>
              <select style={INPUT} value={form.category_id} onChange={e=>set("category_id",e.target.value)}>
                <option value="">— Select Category —</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Badge</label>
              <input style={INPUT} value={form.badge} onChange={e=>set("badge",e.target.value)} placeholder="e.g. Bestseller, New, Limited" />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div style={SECTION}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>Product Details</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
            <div><label style={LABEL}>Fabric</label><input style={INPUT} value={form.fabric} onChange={e=>set("fabric",e.target.value)} /></div>
            <div><label style={LABEL}>Color</label><input style={INPUT} value={form.color} onChange={e=>set("color",e.target.value)} /></div>
            <div><label style={LABEL}>Occasion</label><input style={INPUT} value={form.occasion} onChange={e=>set("occasion",e.target.value)} /></div>
            <div><label style={LABEL}>Length (meters)</label><input style={INPUT} type="number" step="0.1" value={form.length_meters} onChange={e=>set("length_meters",e.target.value)} /></div>
            <div>
              <label style={LABEL}>Blouse Piece</label>
              <select style={INPUT} value={form.blouse_piece} onChange={e=>set("blouse_piece",e.target.value)}>
                <option>Included</option><option>Not Included</option><option>Optional</option>
              </select>
            </div>
            <div><label style={LABEL}>Care Instructions</label><input style={INPUT} value={form.care_instructions} onChange={e=>set("care_instructions",e.target.value)} /></div>
            <div><label style={LABEL}>SKU</label><input style={INPUT} value={form.sku} onChange={e=>set("sku",e.target.value)} /></div>
            <div><label style={LABEL}>Delivery Days</label><input style={INPUT} value={form.delivery_days} onChange={e=>set("delivery_days",e.target.value)} placeholder="5-7" /></div>
          </div>
        </div>

        {/* Product Images */}
        <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",marginBottom:"1.5rem"}}>
          <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"0.5rem",textTransform:"uppercase",letterSpacing:"1px"}}>Product Images</h3>
          <p style={{fontSize:"12px",color:"#A09890",marginBottom:"1rem"}}>Upload, reorder or delete images. Click "Set Primary" to choose the main image.</p>
          <ProductImageUploader productId={id} />
        </div>

        <div style={{display:"flex",gap:"12px",justifyContent:"flex-end"}}>
          <a href="/admin" style={{padding:"12px 24px",border:"1px solid #E4DAD0",borderRadius:"4px",fontSize:"12px",color:"#6B635C",textDecoration:"none",letterSpacing:"1px",textTransform:"uppercase"}}>Cancel</a>
          <button onClick={handleSave} disabled={saving} style={{background:saving?"#A09890":"#6B1A2A",color:"white",padding:"12px 32px",borderRadius:"4px",fontSize:"12px",letterSpacing:"1px",textTransform:"uppercase",border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
