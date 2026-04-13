"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [section, setSection] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!p?.is_admin) { router.push("/"); return; }
      setProfile(p);
      const { data: o, error: oErr } = await supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });
      console.log("ORDERS FETCH:", { count: o?.length, error: oErr?.message, code: oErr?.code });
      if (o && o.length > 0) {
        const userIds = Array.from(new Set(o.map((order: any) => order.user_id)));
        const { data: profileData, error: pErr } = await supabase.from("profiles").select("id, full_name, email, phone").in("id", userIds);
        console.log("PROFILES FETCH:", { count: profileData?.length, error: pErr?.message });
        const profileMap = Object.fromEntries((profileData || []).map((p: any) => [p.id, p]));
        o.forEach((order: any) => { order.profile = profileMap[order.user_id] || null; });
      }
      setOrders(o || []);
      const { data: pr } = await supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false });
      setProducts(pr || []);
      const { data: msgs } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      setMessages(msgs || []);
      setLoading(false);
    }
    load();
  }, []);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { alert("Error: " + error.message); return; }
    setProducts(products.filter(p => p.id !== id));
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:"#FAF8F3"}}><p className="font-serif text-2xl text-maroon">Loading Admin...</p></div>;

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const statusColor: any = { placed:"#FEF3C7", processing:"#DBEAFE", shipped:"#E0E7FF", delivered:"#D1FAE5", cancelled:"#FEE2E2" };
  const statusText: any = { placed:"#92400E", processing:"#1E40AF", shipped:"#3730A3", delivered:"#065F46", cancelled:"#991B1B" };

  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:"⬛" },
    { id:"orders", label:"Orders", icon:"📦" },
    { id:"products", label:"Products", icon:"🧵" },
    { id:"customers", label:"Customers", icon:"👤" },
    { id:"messages", label:"Messages", icon:"✉️" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#FAF8F3",display:"flex",flexDirection:"column"}}>
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={()=>setSelectedOrder(null)} />}
      {/* Top bar */}
      <div style={{background:"#1A1614",padding:"12px 2rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",color:"#FAF8F3",letterSpacing:"2px"}}>ZARIKA <span style={{color:"#B8973C"}}>ADMIN</span></span>
          <span style={{background:"#B8973C",color:"#1A1614",fontSize:"10px",padding:"2px 10px",borderRadius:"10px",letterSpacing:"1px",textTransform:"uppercase",fontWeight:600}}>Staff</span>
        </div>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          <a href="/" style={{color:"rgba(255,255,255,0.5)",fontSize:"12px",textDecoration:"none"}}>View Store →</a>
          <button onClick={async()=>{await supabase.auth.signOut();router.push("/");}} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.5)",padding:"6px 14px",borderRadius:"3px",cursor:"pointer",fontSize:"12px"}}>Logout</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1}}>
        {/* Sidebar */}
        <div style={{width:"220px",background:"#2C2420",display:"flex",flexDirection:"column",padding:"1.5rem 0"}}>
          {navItems.map(item => (
            <button key={item.id} onClick={()=>setSection(item.id)}
              style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 1.5rem",fontSize:"13px",color:section===item.id?"#D4AF62":"rgba(255,255,255,0.45)",background:section===item.id?"rgba(184,151,60,0.1)":"none",border:"none",borderLeft:section===item.id?"3px solid #B8973C":"3px solid transparent",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{flex:1,padding:"2.5rem",overflow:"auto"}}>

          {/* DASHBOARD */}
          {section === "dashboard" && (
            <div>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:400,color:"#2C2420",marginBottom:"2rem"}}>Dashboard</h1>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"2rem"}}>
                {[
                  {label:"Total Revenue",value:"₹"+totalRevenue.toLocaleString("en-IN"),color:"#6B1A2A"},
                  {label:"Total Orders",value:orders.length,color:"#1A3D6B"},
                  {label:"Products",value:products.length,color:"#1E5C2E"},
                  {label:"Pending Orders",value:orders.filter(o=>o.status==="placed").length,color:"#6B3D1A"},
                ].map(m=>(
                  <div key={m.label} style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",borderTop:`3px solid ${m.color}`}}>
                    <div style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"8px"}}>{m.label}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"36px",fontWeight:400,color:"#2C2420"}}>{m.value}</div>
                  </div>
                ))}
              </div>
              {products.filter(p=>p.stock_quantity<=5&&p.is_active).length>0&&(
                <div style={{background:"#FEF3C7",border:"1px solid #F59E0B",borderRadius:"6px",padding:"1rem 1.5rem",marginBottom:"1.5rem"}}>
                  <p style={{fontSize:"13px",fontWeight:600,color:"#92400E",marginBottom:"8px"}}>⚠️ Low Stock Alert</p>
                  {products.filter(p=>p.stock_quantity<=5&&p.is_active).map(p=>(
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#92400E",marginBottom:"4px"}}>
                      <span>{p.name}</span>
                      <span style={{fontWeight:600}}>{p.stock_quantity} left</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem"}}>
                <h3 style={{fontSize:"14px",fontWeight:500,marginBottom:"1rem",color:"#2C2420"}}>Recent Orders</h3>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                  <thead><tr style={{borderBottom:"1px solid #EDE6DC"}}>
                    {["Order","Customer","Amount","Status","Action"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {orders.slice(0,5).map(o=>(
                      <tr key={o.id} style={{borderBottom:"1px solid #EDE6DC"}}>
                        <td style={{padding:"13px 12px",fontWeight:500}}>#{o.id.slice(0,8).toUpperCase()}</td>
                        <td style={{padding:"13px 12px",color:"#6B635C"}}>{o.profile?.full_name || o.profile?.email || "Customer"}</td>
                        <td style={{padding:"13px 12px"}}>₹{o.total?.toLocaleString("en-IN")}</td>
                        <td style={{padding:"13px 12px"}}><span style={{background:statusColor[o.status]||"#F3F4F6",color:statusText[o.status]||"#374151",padding:"3px 10px",borderRadius:"10px",fontSize:"11px",fontWeight:500}}>{o.status}</span></td>
                        <td style={{padding:"13px 12px"}}>
                          <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)} style={{fontSize:"12px",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"4px 8px",background:"#FAF8F3",cursor:"pointer"}}>
                            {["placed","processing","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {section === "orders" && (
            <div>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:400,color:"#2C2420",marginBottom:"2rem"}}>Order Management</h1>
              <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                  <thead><tr style={{borderBottom:"1px solid #EDE6DC"}}>
                    {["Order ID","Customer","Items","Amount","Payment","Status","Update"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {orders.map(o=>(
                      <tr key={o.id} style={{borderBottom:"1px solid #EDE6DC"}}>
                        <td style={{padding:"13px 12px",fontWeight:500,fontSize:"12px"}}>#{o.id.slice(0,8).toUpperCase()}</td>
                        <td style={{padding:"13px 12px",color:"#6B635C"}}>{o.profile?.full_name || o.profile?.email || "—"}</td>
                        <td style={{padding:"13px 12px"}}>{o.items?.length || 0} items</td>
                        <td style={{padding:"13px 12px",fontWeight:500,color:"#6B1A2A"}}>₹{o.total?.toLocaleString("en-IN")}</td>
                        <td style={{padding:"13px 12px"}}><span style={{fontSize:"11px",color:"#6B635C"}}>{o.payment_method?.toUpperCase()}</span></td>
                        <td style={{padding:"13px 12px"}}><span style={{background:statusColor[o.status]||"#F3F4F6",color:statusText[o.status]||"#374151",padding:"3px 10px",borderRadius:"10px",fontSize:"11px",fontWeight:500}}>{o.status}</span></td>
                        <td style={{padding:"13px 12px",display:"flex",gap:"8px",alignItems:"center"}}>
                          <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)} style={{fontSize:"12px",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"4px 8px",background:"#FAF8F3",cursor:"pointer"}}>
                            {["placed","processing","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={()=>setSelectedOrder(o)} style={{fontSize:"11px",background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"4px 10px",cursor:"pointer",color:"#6B635C",whiteSpace:"nowrap"}}>View</button>
                        </td>
                      </tr>
                    ))}
                    {orders.length===0&&<tr><td colSpan={7} style={{padding:"2rem",textAlign:"center",color:"#A09890"}}>No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {section === "products" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2rem"}}>
                <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:400,color:"#2C2420"}}>Products</h1>
                <a href="/admin/add-product" style={{background:"#6B1A2A",color:"white",padding:"10px 24px",borderRadius:"3px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",textDecoration:"none"}}>+ Add Product</a>
              </div>
              <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                  <thead><tr style={{borderBottom:"1px solid #EDE6DC"}}>
                    {["Product","Category","Price","Stock","Status",""].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {products.map(p=>(
                      <tr key={p.id} style={{borderBottom:"1px solid #EDE6DC"}}>
                        <td style={{padding:"13px 12px"}}>
                          <div style={{fontWeight:500,color:"#2C2420"}}>{p.name}</div>
                          <div style={{fontSize:"11px",color:"#A09890"}}>{p.fabric} · {p.color?.split(" ")[0]}</div>
                        </td>
                        <td style={{padding:"13px 12px",color:"#6B635C"}}>{p.category?.name || "—"}</td>
                        <td style={{padding:"13px 12px",color:"#6B1A2A",fontWeight:500}}>₹{p.price?.toLocaleString("en-IN")}</td>
                        <td style={{padding:"13px 12px"}}>
                          <span style={{color:p.stock_quantity<5?"#C0392B":p.stock_quantity<15?"#D97706":"#2D8A3E",fontWeight:500}}>{p.stock_quantity}</span>
                        </td>
                        <td style={{padding:"13px 12px"}}>
                          <span style={{background:p.is_active?"#D1FAE5":"#FEE2E2",color:p.is_active?"#065F46":"#991B1B",padding:"3px 10px",borderRadius:"10px",fontSize:"11px",fontWeight:500}}>
                            {p.is_active?"Active":"Inactive"}
                          </span>
                        </td>
                        <td style={{padding:"13px 12px",display:"flex",gap:"8px"}}>
                          <a href={"/admin/edit-product/"+p.id} style={{background:"none",border:"1px solid #E4DAD0",color:"#6B635C",padding:"4px 12px",borderRadius:"3px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"none"}}>Edit</a>
                          <button onClick={()=>deleteProduct(p.id,p.name)} style={{background:"none",border:"1px solid #FCA5A5",color:"#DC2626",padding:"4px 12px",borderRadius:"3px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {section === "customers" && <CustomerSection supabase={supabase} />}

          {section === "messages" && (
            <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",overflow:"hidden"}}>
              <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #EDE6DC",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:400,color:"#2C2420",margin:0}}>Contact Messages</h2>
                <span style={{fontSize:"12px",color:"#A09890"}}>{messages.length} message{messages.length!==1?"s":""}</span>
              </div>
              {messages.length === 0 ? (
                <div style={{padding:"3rem",textAlign:"center",color:"#A09890",fontSize:"13px"}}>No messages yet.</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:0}}>
                  {messages.map((msg,i) => (
                    <div key={msg.id} style={{padding:"1.25rem 1.5rem",borderBottom:i<messages.length-1?"1px solid #EDE6DC":"none",background:i%2===0?"white":"#FAFAF8"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px",flexWrap:"wrap",gap:"8px"}}>
                        <div>
                          <span style={{fontWeight:500,fontSize:"14px",color:"#2C2420"}}>{msg.name}</span>
                          <span style={{fontSize:"12px",color:"#A09890",marginLeft:"10px"}}>{msg.email}</span>
                          {msg.phone && <span style={{fontSize:"12px",color:"#A09890",marginLeft:"10px"}}>{msg.phone}</span>}
                        </div>
                        <span style={{fontSize:"11px",color:"#A09890"}}>{new Date(msg.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                      {msg.subject && <div style={{fontSize:"12px",fontWeight:500,color:"#6B1A2A",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.5px"}}>{msg.subject}</div>}
                      <div style={{fontSize:"13px",color:"#4A4340",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{msg.message}</div>
                      <a href={`mailto:${msg.email}`} style={{display:"inline-block",marginTop:"10px",fontSize:"11px",color:"#B8973C",border:"1px solid #B8973C",borderRadius:"3px",padding:"4px 12px",textDecoration:"none"}}>Reply via Email</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: any, onClose: ()=>void }) {
  const [address, setAddress] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    if (order?.address_id) {
      supabase.from("addresses").select("*").eq("id", order.address_id).single()
        .then(({ data }) => setAddress(data));
    }
  }, [order?.address_id]);
  if (!order) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}} onClick={onClose}>
      <div style={{background:"white",borderRadius:"8px",padding:"2rem",maxWidth:"600px",width:"100%",maxHeight:"85vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",fontWeight:400,color:"#2C2420"}}>Order #{order.id.slice(0,8).toUpperCase()}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"20px",cursor:"pointer",color:"#A09890"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"1.5rem"}}>
          {[
            {label:"Customer",value:order.profile?.full_name||"—"},
            {label:"Email",value:order.profile?.email||"—"},
            {label:"Phone",value:order.profile?.phone||"—"},
            {label:"Payment",value:order.payment_method?.toUpperCase()},
            {label:"Payment Status",value:order.payment_status},
            {label:"Order Date",value:new Date(order.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})},
          ].map(f=>(
            <div key={f.label} style={{padding:"10px 12px",background:"#FAF8F3",border:"1px solid #EDE6DC",borderRadius:"4px"}}>
              <div style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"3px"}}>{f.label}</div>
              <div style={{fontSize:"13px",color:"#2C2420",fontWeight:500}}>{f.value}</div>
            </div>
          ))}
        </div>
        {address && (
          <div style={{marginBottom:"1.5rem"}}>
            <h3 style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"10px"}}>Delivery Address</h3>
            <div style={{padding:"12px",background:"#FAF8F3",border:"1px solid #EDE6DC",borderRadius:"4px",fontSize:"13px",color:"#2C2420",lineHeight:1.7}}>
              <div style={{fontWeight:500}}>{address.full_name}</div>
              <div>{address.line1}{address.line2 ? ", " + address.line2 : ""}</div>
              <div>{address.city}, {address.state} – {address.pincode}</div>
              <div style={{color:"#6B635C"}}>{address.phone}</div>
            </div>
          </div>
        )}
        <h3 style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"10px"}}>Items Ordered</h3>
        {(order.items||[]).map((item: any)=>(
          <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #EDE6DC"}}>
            <div>
              <div style={{fontSize:"14px",fontWeight:500,color:"#2C2420"}}>{item.product_name}</div>
              <div style={{fontSize:"12px",color:"#A09890"}}>Qty: {item.quantity}</div>
            </div>
            <div style={{fontSize:"14px",color:"#6B1A2A",fontWeight:500}}>₹{(item.price*item.quantity).toLocaleString("en-IN")}</div>
          </div>
        ))}
        <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:"2px solid #EDE6DC"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#6B635C",marginBottom:"6px"}}><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString("en-IN")}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#6B635C",marginBottom:"6px"}}><span>Shipping</span><span>{order.shipping===0?"Free":"₹"+order.shipping}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"16px",fontWeight:600,color:"#2C2420"}}><span>Total</span><span style={{color:"#6B1A2A"}}>₹{order.total?.toLocaleString("en-IN")}</span></div>
        </div>
      </div>
    </div>
  );
}

function CustomerSection({ supabase }: { supabase: any }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingC, setLoadingC] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, created_at")
        .order("created_at", { ascending: false });

      if (!profiles) { setLoadingC(false); return; }

      const { data: orders } = await supabase
        .from("orders")
        .select("user_id, total");

      const orderMap: Record<string, { count: number; total: number }> = {};
      (orders || []).forEach((o: any) => {
        if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, total: 0 };
        orderMap[o.user_id].count += 1;
        orderMap[o.user_id].total += o.total || 0;
      });

      setCustomers(profiles.map((p: any) => ({
        ...p,
        orderCount: orderMap[p.id]?.count || 0,
        orderTotal: orderMap[p.id]?.total || 0,
      })));
      setLoadingC(false);
    }
    load();
  }, []);

  if (loadingC) return <div style={{padding:"2rem",color:"#A09890"}}>Loading customers...</div>;

  return (
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:400,color:"#2C2420",marginBottom:"2rem"}}>Customers</h1>
      <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
          <thead><tr style={{borderBottom:"1px solid #EDE6DC"}}>
            {["Name","Email","Phone","Orders","Total Spent","Joined"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {customers.map(c=>(
              <tr key={c.id} style={{borderBottom:"1px solid #EDE6DC"}}>
                <td style={{padding:"13px 12px",fontWeight:500,color:"#2C2420"}}>{c.full_name||"—"}</td>
                <td style={{padding:"13px 12px",color:"#6B635C"}}>{c.email||"—"}</td>
                <td style={{padding:"13px 12px",color:"#6B635C"}}>{c.phone||"—"}</td>
                <td style={{padding:"13px 12px",color:"#6B635C",fontWeight:500}}>{c.orderCount}</td>
                <td style={{padding:"13px 12px",color:"#6B1A2A",fontWeight:500}}>{c.orderTotal>0?"₹"+c.orderTotal.toLocaleString("en-IN"):"—"}</td>
                <td style={{padding:"13px 12px",color:"#A09890"}}>{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {customers.length===0&&<tr><td colSpan={6} style={{padding:"2rem",textAlign:"center",color:"#A09890"}}>No customers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}