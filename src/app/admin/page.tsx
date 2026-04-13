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
  const [orderFilter, setOrderFilter] = useState({ status: "all", payment: "all", search: "" });
  const [returns, setReturns] = useState<any[]>([]);
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
      const { data: o } = await supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });
      if (o && o.length > 0) {
        const userIds = Array.from(new Set(o.map((order: any) => order.user_id)));
        const { data: profileData } = await supabase.from("profiles").select("id, full_name, email, phone").in("id", userIds);
        const profileMap = Object.fromEntries((profileData || []).map((p: any) => [p.id, p]));
        o.forEach((order: any) => { order.profile = profileMap[order.user_id] || null; });
      }
      setOrders(o || []);
      const { data: pr } = await supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false });
      setProducts(pr || []);
      const { data: msgs } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      const { data: ret } = await supabase.from("return_requests").select("*, order:orders(id,total), profile:profiles!return_requests_user_id_fkey(full_name,email,phone)").order("created_at", { ascending: false });
      setReturns(ret || []);
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
    const order = orders.find(o => o.id === id);
    const updates: any = { status };
    if (status === "delivered" && order?.payment_method === "cod") updates.payment_status = "paid";
    await supabase.from("orders").update(updates).eq("id", id);
    setOrders(orders.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const updateReturnStatus = async (id: string, status: string, adminNote: string) => {
    await supabase.from("return_requests").update({ status, admin_note: adminNote, updated_at: new Date().toISOString() }).eq("id", id);
    setReturns(returns.map(r => r.id === id ? { ...r, status, admin_note: adminNote } : r));
  };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F8F9FA"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",color:"#6B1A2A",marginBottom:"8px"}}>Zarika Admin</div>
        <div style={{fontSize:"13px",color:"#9CA3AF"}}>Loading...</div>
      </div>
    </div>
  );

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const todayRevenue = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "placed").length;
  const processingOrders = orders.filter(o => o.status === "processing").length;
  const shippedOrders = orders.filter(o => o.status === "shipped").length;
  const statusColor: any = { placed:"#FEF3C7", processing:"#DBEAFE", shipped:"#E0E7FF", delivered:"#D1FAE5", cancelled:"#FEE2E2" };
  const statusText: any = { placed:"#92400E", processing:"#1E40AF", shipped:"#3730A3", delivered:"#065F46", cancelled:"#991B1B" };

  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:"▦", badge: null },
    { id:"orders", label:"Orders", icon:"◫", badge: pendingOrders > 0 ? pendingOrders : null },
    { id:"products", label:"Products", icon:"◈", badge: null },
    { id:"customers", label:"Customers", icon:"◉", badge: null },
    { id:"messages", label:"Messages", icon:"◎", badge: messages.length > 0 ? messages.length : null },
    { id:"returns", label:"Returns", icon:"↩", badge: returns.filter(r=>r.status==="requested").length > 0 ? returns.filter(r=>r.status==="requested").length : null },
  ];

  const filteredOrders = orders.filter(o => {
    if (orderFilter.status !== "all" && o.status !== orderFilter.status) return false;
    if (orderFilter.payment !== "all" && o.payment_method !== orderFilter.payment) return false;
    if (orderFilter.search) {
      const q = orderFilter.search.toLowerCase();
      if (!o.id.includes(q) && !(o.profile?.full_name||"").toLowerCase().includes(q) && !(o.profile?.email||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div style={{minHeight:"100vh",background:"#F8F9FA",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif"}}>
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={()=>setSelectedOrder(null)} updateStatus={updateOrderStatus} />}
      <div style={{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"0 2rem",display:"flex",justifyContent:"space-between",alignItems:"center",height:"56px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",color:"#111827",letterSpacing:"1px"}}>Zarika <span style={{color:"#6B1A2A"}}>Admin</span></span>
          <span style={{background:"#FEF3C7",color:"#92400E",fontSize:"10px",padding:"2px 8px",borderRadius:"4px",letterSpacing:"0.5px",fontWeight:600}}>STAFF</span>
        </div>
        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <span style={{fontSize:"12px",color:"#6B7280"}}>👤 {profile?.full_name||profile?.email}</span>
          <a href="/" style={{fontSize:"12px",color:"#6B7280",textDecoration:"none",padding:"6px 12px",border:"1px solid #E5E7EB",borderRadius:"6px"}}>← View Store</a>
          <button onClick={async()=>{await supabase.auth.signOut();router.push("/");}} style={{background:"#6B1A2A",color:"white",border:"none",padding:"6px 14px",borderRadius:"6px",cursor:"pointer",fontSize:"12px",fontWeight:500}}>Sign Out</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1}}>
        <div style={{width:"220px",background:"#fff",borderRight:"1px solid #E5E7EB",display:"flex",flexDirection:"column",padding:"1.5rem 0",position:"sticky",top:"56px",height:"calc(100vh - 56px)",overflow:"auto"}}>
          <div style={{padding:"0 1.5rem",marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",letterSpacing:"1.5px",color:"#9CA3AF",textTransform:"uppercase",fontWeight:600}}>Navigation</div>
          </div>
          {navItems.map(item => (
            <button key={item.id} onClick={()=>setSection(item.id)}
              style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 1.5rem",fontSize:"13px",color:section===item.id?"#6B1A2A":"#4B5563",background:section===item.id?"#FDF2F4":"none",border:"none",borderLeft:section===item.id?"3px solid #6B1A2A":"3px solid transparent",cursor:"pointer",textAlign:"left",fontWeight:section===item.id?600:400,width:"100%"}}>
              <span style={{fontSize:"15px"}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge && <span style={{background:"#6B1A2A",color:"white",borderRadius:"10px",fontSize:"10px",padding:"1px 7px",fontWeight:700}}>{item.badge}</span>}
            </button>
          ))}
        </div>

        <div style={{flex:1,padding:"2rem",overflow:"auto",minWidth:0}}>

          {section === "dashboard" && (
            <div>
              <div style={{marginBottom:"1.5rem"}}>
                <h1 style={{fontSize:"22px",fontWeight:600,color:"#111827",margin:0}}>Dashboard</h1>
                <p style={{fontSize:"13px",color:"#6B7280",margin:"4px 0 0"}}>Welcome back, {profile?.full_name?.split(" ")[0]||"Admin"}</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"1.5rem"}}>
                {[
                  {label:"Total Revenue",value:"₹"+totalRevenue.toLocaleString("en-IN"),sub:"All time",icon:"💰",color:"#6B1A2A",bg:"#FDF2F4"},
                  {label:"Today's Revenue",value:"₹"+todayRevenue.toLocaleString("en-IN"),sub:"Today",icon:"📈",color:"#065F46",bg:"#ECFDF5"},
                  {label:"Total Orders",value:orders.length,sub:`${pendingOrders} pending`,icon:"📦",color:"#1E40AF",bg:"#EFF6FF"},
                  {label:"Active Products",value:products.filter(p=>p.is_active).length,sub:`${products.length} total`,icon:"🧵",color:"#7C3AED",bg:"#F5F3FF"},
                ].map(m=>(
                  <div key={m.label} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",padding:"1.25rem",display:"flex",flexDirection:"column",gap:"8px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{fontSize:"11px",color:"#6B7280",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.5px"}}>{m.label}</div>
                      <div style={{background:m.bg,borderRadius:"8px",padding:"6px",fontSize:"18px"}}>{m.icon}</div>
                    </div>
                    <div style={{fontSize:"26px",fontWeight:700,color:"#111827",fontFamily:"'DM Sans',sans-serif"}}>{m.value}</div>
                    <div style={{fontSize:"11px",color:m.color,fontWeight:500}}>{m.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",padding:"1.25rem",marginBottom:"1.5rem"}}>
                <div style={{fontSize:"13px",fontWeight:600,color:"#111827",marginBottom:"1rem"}}>Order Pipeline</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"8px"}}>
                  {[
                    {label:"New",status:"placed",color:"#92400E",bg:"#FEF3C7",count:pendingOrders},
                    {label:"Processing",status:"processing",color:"#1E40AF",bg:"#DBEAFE",count:processingOrders},
                    {label:"Shipped",status:"shipped",color:"#3730A3",bg:"#E0E7FF",count:shippedOrders},
                    {label:"Delivered",status:"delivered",color:"#065F46",bg:"#D1FAE5",count:orders.filter(o=>o.status==="delivered").length},
                    {label:"Cancelled",status:"cancelled",color:"#991B1B",bg:"#FEE2E2",count:orders.filter(o=>o.status==="cancelled").length},
                  ].map(s=>(
                    <button key={s.status} onClick={()=>{setSection("orders");setOrderFilter(f=>({...f,status:s.status}));}}
                      style={{background:s.bg,border:"none",borderRadius:"8px",padding:"12px",cursor:"pointer",textAlign:"center"}}>
                      <div style={{fontSize:"22px",fontWeight:700,color:s.color}}>{s.count}</div>
                      <div style={{fontSize:"11px",color:s.color,fontWeight:500,marginTop:"2px"}}>{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",padding:"1.25rem"}}>
                  <div style={{fontSize:"13px",fontWeight:600,color:"#111827",marginBottom:"1rem"}}>⚠️ Low Stock ({products.filter(p=>p.stock_quantity<=5&&p.is_active).length})</div>
                  {products.filter(p=>p.stock_quantity<=5&&p.is_active).length===0?(
                    <div style={{fontSize:"13px",color:"#9CA3AF",padding:"0.5rem 0"}}>All products well stocked ✓</div>
                  ):products.filter(p=>p.stock_quantity<=5&&p.is_active).map(p=>(
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                      <div>
                        <div style={{fontSize:"13px",fontWeight:500,color:"#111827"}}>{p.name}</div>
                        <div style={{fontSize:"11px",color:"#6B7280"}}>{p.category?.name}</div>
                      </div>
                      <span style={{background:p.stock_quantity===0?"#FEE2E2":"#FEF3C7",color:p.stock_quantity===0?"#991B1B":"#92400E",padding:"2px 10px",borderRadius:"10px",fontSize:"12px",fontWeight:600}}>
                        {p.stock_quantity===0?"Out of stock":`${p.stock_quantity} left`}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",padding:"1.25rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                    <div style={{fontSize:"13px",fontWeight:600,color:"#111827"}}>Recent Orders</div>
                    <button onClick={()=>setSection("orders")} style={{fontSize:"11px",color:"#6B1A2A",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>View all →</button>
                  </div>
                  {orders.slice(0,5).map(o=>(
                    <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}} onClick={()=>setSelectedOrder(o)}>
                      <div>
                        <div style={{fontSize:"12px",fontWeight:600,color:"#111827",fontFamily:"monospace"}}>#{o.id.slice(0,8).toUpperCase()}</div>
                        <div style={{fontSize:"11px",color:"#6B7280"}}>{o.profile?.full_name||"—"}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"13px",fontWeight:600,color:"#6B1A2A"}}>₹{o.total?.toLocaleString("en-IN")}</div>
                        <span style={{background:statusColor[o.status],color:statusText[o.status],padding:"1px 8px",borderRadius:"8px",fontSize:"10px",fontWeight:500}}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === "orders" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
                <div>
                  <h1 style={{fontSize:"22px",fontWeight:600,color:"#111827",margin:0}}>Orders</h1>
                  <p style={{fontSize:"13px",color:"#6B7280",margin:"4px 0 0"}}>{filteredOrders.length} of {orders.length} orders</p>
                </div>
              </div>
              <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",overflow:"hidden"}}>
                <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #E5E7EB",display:"flex",gap:"10px",flexWrap:"wrap"}}>
                  <input placeholder="🔍  Search customer name or order ID..." value={orderFilter.search} onChange={e=>setOrderFilter({...orderFilter,search:e.target.value})}
                    style={{flex:1,minWidth:"220px",padding:"8px 12px",fontSize:"13px",border:"1px solid #E5E7EB",borderRadius:"6px",outline:"none",background:"#F9FAFB"}} />
                  <select value={orderFilter.status} onChange={e=>setOrderFilter({...orderFilter,status:e.target.value})}
                    style={{padding:"8px 12px",fontSize:"13px",border:"1px solid #E5E7EB",borderRadius:"6px",background:"#F9FAFB",color:"#374151",cursor:"pointer"}}>
                    <option value="all">All Statuses</option>
                    {["placed","processing","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <select value={orderFilter.payment} onChange={e=>setOrderFilter({...orderFilter,payment:e.target.value})}
                    style={{padding:"8px 12px",fontSize:"13px",border:"1px solid #E5E7EB",borderRadius:"6px",background:"#F9FAFB",color:"#374151",cursor:"pointer"}}>
                    <option value="all">All Payments</option>
                    <option value="cod">COD</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                  </select>
                  {(orderFilter.status!=="all"||orderFilter.payment!=="all"||orderFilter.search)&&
                    <button onClick={()=>setOrderFilter({status:"all",payment:"all",search:""})}
                      style={{padding:"8px 12px",fontSize:"13px",border:"1px solid #E5E7EB",borderRadius:"6px",background:"#F9FAFB",color:"#6B7280",cursor:"pointer"}}>Clear ✕</button>}
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                    <thead>
                      <tr style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB"}}>
                        {["Order ID","Date","Customer","Phone","Items","Amount","Payment","Pay Status","Status","Update"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"11px",fontWeight:600,color:"#6B7280",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o,i)=>(
                        <tr key={o.id} style={{borderBottom:"1px solid #F3F4F6",background:i%2===0?"#fff":"#FAFAFA"}}>
                          <td style={{padding:"12px 14px",fontFamily:"monospace",fontSize:"12px",fontWeight:600,color:"#374151",whiteSpace:"nowrap"}}>#{o.id.slice(0,8).toUpperCase()}</td>
                          <td style={{padding:"12px 14px",color:"#6B7280",fontSize:"12px",whiteSpace:"nowrap"}}>
                            {new Date(o.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                            <div style={{fontSize:"10px",color:"#9CA3AF"}}>{new Date(o.created_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
                          </td>
                          <td style={{padding:"12px 14px",whiteSpace:"nowrap"}}>
                            <div style={{fontWeight:500,color:"#111827"}}>{o.profile?.full_name||"—"}</div>
                            <div style={{fontSize:"11px",color:"#9CA3AF"}}>{o.profile?.email||""}</div>
                          </td>
                          <td style={{padding:"12px 14px",color:"#6B7280",fontSize:"12px",whiteSpace:"nowrap"}}>{o.profile?.phone||"—"}</td>
                          <td style={{padding:"12px 14px",color:"#6B7280",textAlign:"center"}}>{o.items?.length||0}</td>
                          <td style={{padding:"12px 14px",fontWeight:600,color:"#6B1A2A",whiteSpace:"nowrap"}}>₹{o.total?.toLocaleString("en-IN")}</td>
                          <td style={{padding:"12px 14px"}}><span style={{background:"#F3F4F6",color:"#374151",padding:"2px 8px",borderRadius:"4px",fontSize:"11px",fontWeight:500}}>{o.payment_method?.toUpperCase()}</span></td>
                          <td style={{padding:"12px 14px"}}>
                            <span style={{background:o.payment_status==="paid"?"#D1FAE5":"#FEF3C7",color:o.payment_status==="paid"?"#065F46":"#92400E",padding:"2px 8px",borderRadius:"4px",fontSize:"11px",fontWeight:500,whiteSpace:"nowrap"}}>
                              {o.payment_status==="paid"?"✓ Paid":"⏳ Pending"}
                            </span>
                          </td>
                          <td style={{padding:"12px 14px"}}><span style={{background:statusColor[o.status]||"#F3F4F6",color:statusText[o.status]||"#374151",padding:"2px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:500,whiteSpace:"nowrap"}}>{o.status?.charAt(0).toUpperCase()+o.status?.slice(1)}</span></td>
                          <td style={{padding:"12px 14px"}}>
                            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                              <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)} style={{fontSize:"12px",border:"1px solid #E5E7EB",borderRadius:"6px",padding:"4px 6px",background:"white",color:"#374151",cursor:"pointer"}}>
                                {["placed","processing","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
                              </select>
                              <button onClick={()=>setSelectedOrder(o)} style={{background:"#6B1A2A",color:"white",border:"none",borderRadius:"6px",padding:"4px 10px",fontSize:"12px",cursor:"pointer",whiteSpace:"nowrap",fontWeight:500}}>View</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length===0&&<tr><td colSpan={10} style={{padding:"3rem",textAlign:"center",color:"#9CA3AF",fontSize:"13px"}}>{orders.length===0?"No orders yet":"No orders match your filters"}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {section === "products" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
                <div>
                  <h1 style={{fontSize:"22px",fontWeight:600,color:"#111827",margin:0}}>Products</h1>
                  <p style={{fontSize:"13px",color:"#6B7280",margin:"4px 0 0"}}>{products.filter(p=>p.is_active).length} active · {products.filter(p=>p.stock_quantity<=5).length} low stock</p>
                </div>
                <a href="/admin/add-product" style={{background:"#6B1A2A",color:"white",padding:"8px 18px",borderRadius:"6px",fontSize:"13px",fontWeight:500,textDecoration:"none"}}>+ Add Product</a>
              </div>
              <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                  <thead>
                    <tr style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB"}}>
                      {["Product","Category","Price / MRP","Stock","Featured","Status","Actions"].map(h=>(
                        <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"11px",fontWeight:600,color:"#6B7280"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p,i)=>(
                      <tr key={p.id} style={{borderBottom:"1px solid #F3F4F6",background:i%2===0?"#fff":"#FAFAFA"}}>
                        <td style={{padding:"12px 14px"}}>
                          <div style={{fontWeight:500,color:"#111827"}}>{p.name}</div>
                          <div style={{fontSize:"11px",color:"#9CA3AF",marginTop:"2px"}}>{p.fabric} · {p.color?.split(" ")[0]}</div>
                        </td>
                        <td style={{padding:"12px 14px",color:"#6B7280"}}>{p.category?.name||"—"}</td>
                        <td style={{padding:"12px 14px"}}>
                          <div style={{fontWeight:600,color:"#6B1A2A"}}>₹{p.price?.toLocaleString("en-IN")}</div>
                          {p.mrp&&<div style={{fontSize:"11px",color:"#9CA3AF",textDecoration:"line-through"}}>₹{p.mrp?.toLocaleString("en-IN")}</div>}
                        </td>
                        <td style={{padding:"12px 14px"}}>
                          <span style={{background:p.stock_quantity===0?"#FEE2E2":p.stock_quantity<=5?"#FEF3C7":p.stock_quantity<=15?"#FEF9C3":"#D1FAE5",color:p.stock_quantity===0?"#991B1B":p.stock_quantity<=5?"#92400E":p.stock_quantity<=15?"#713F12":"#065F46",padding:"3px 10px",borderRadius:"4px",fontSize:"12px",fontWeight:600}}>
                            {p.stock_quantity===0?"Out of stock":p.stock_quantity}
                          </span>
                        </td>
                        <td style={{padding:"12px 14px"}}>{p.is_featured?<span style={{color:"#D97706",fontSize:"18px"}}>★</span>:<span style={{color:"#E5E7EB",fontSize:"18px"}}>☆</span>}</td>
                        <td style={{padding:"12px 14px"}}>
                          <span style={{background:p.is_active?"#D1FAE5":"#F3F4F6",color:p.is_active?"#065F46":"#6B7280",padding:"3px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:500}}>{p.is_active?"Active":"Inactive"}</span>
                        </td>
                        <td style={{padding:"12px 14px"}}>
                          <div style={{display:"flex",gap:"6px"}}>
                            <a href={"/admin/edit-product/"+p.id} style={{background:"#F3F4F6",color:"#374151",padding:"4px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:500,textDecoration:"none"}}>Edit</a>
                            <button onClick={()=>deleteProduct(p.id,p.name)} style={{background:"#FEF2F2",color:"#DC2626",border:"none",padding:"4px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:500,cursor:"pointer"}}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "customers" && <CustomerSection supabase={supabase} />}

          {section === "returns" && <ReturnsSection returns={returns} updateReturnStatus={updateReturnStatus} />}

          {section === "messages" && (
            <div>
              <div style={{marginBottom:"1.5rem"}}>
                <h1 style={{fontSize:"22px",fontWeight:600,color:"#111827",margin:0}}>Contact Messages</h1>
                <p style={{fontSize:"13px",color:"#6B7280",margin:"4px 0 0"}}>{messages.length} message{messages.length!==1?"s":""}</p>
              </div>
              {messages.length===0?(
                <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",padding:"3rem",textAlign:"center",color:"#9CA3AF",fontSize:"13px"}}>No messages yet.</div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {messages.map(msg=>(
                    <div key={msg.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",padding:"1.25rem"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
                        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"#FDF2F4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:600,color:"#6B1A2A",flexShrink:0}}>
                            {(msg.name||"?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontWeight:600,fontSize:"14px",color:"#111827"}}>{msg.name}</div>
                            <div style={{fontSize:"12px",color:"#6B7280"}}>{msg.email}{msg.phone?` · ${msg.phone}`:""}</div>
                          </div>
                        </div>
                        <div style={{fontSize:"11px",color:"#9CA3AF",textAlign:"right"}}>
                          {new Date(msg.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          <div>{new Date(msg.created_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      </div>
                      {msg.subject&&<div style={{fontSize:"12px",fontWeight:600,color:"#6B1A2A",marginBottom:"8px",background:"#FDF2F4",padding:"4px 10px",borderRadius:"4px",display:"inline-block"}}>{msg.subject}</div>}
                      <div style={{fontSize:"13px",color:"#374151",lineHeight:1.7,whiteSpace:"pre-wrap",background:"#F9FAFB",padding:"12px",borderRadius:"6px",marginBottom:"10px"}}>{msg.message}</div>
                      <a href={`mailto:${msg.email}?subject=Re: ${msg.subject||"Your enquiry at Zarika Studio"}`}
                        style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#6B1A2A",border:"1px solid #6B1A2A",borderRadius:"6px",padding:"6px 14px",textDecoration:"none",fontWeight:500}}>
                        ✉ Reply via Email
                      </a>
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

function OrderDetailModal({ order, onClose, updateStatus }: { order: any, onClose: ()=>void, updateStatus: (id:string,status:string)=>void }) {
  const [address, setAddress] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    if (order?.address_id) {
      supabase.from("addresses").select("*").eq("id", order.address_id).single().then(({ data }) => setAddress(data));
    }
  }, [order?.address_id]);
  if (!order) return null;
  const statusColor: any = { placed:"#FEF3C7", processing:"#DBEAFE", shipped:"#E0E7FF", delivered:"#D1FAE5", cancelled:"#FEE2E2" };
  const statusText: any = { placed:"#92400E", processing:"#1E40AF", shipped:"#3730A3", delivered:"#065F46", cancelled:"#991B1B" };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",backdropFilter:"blur(2px)"}} onClick={onClose}>
      <div style={{background:"white",borderRadius:"12px",width:"100%",maxWidth:"640px",maxHeight:"88vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #E5E7EB",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white",borderRadius:"12px 12px 0 0"}}>
          <div>
            <div style={{fontSize:"16px",fontWeight:700,color:"#111827",fontFamily:"monospace"}}>Order #{order.id.slice(0,8).toUpperCase()}</div>
            <div style={{fontSize:"12px",color:"#6B7280",marginTop:"2px"}}>{new Date(order.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{background:statusColor[order.status],color:statusText[order.status],padding:"4px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:600}}>{order.status?.charAt(0).toUpperCase()+order.status?.slice(1)}</span>
            <button onClick={onClose} style={{background:"#F3F4F6",border:"none",borderRadius:"6px",width:"32px",height:"32px",cursor:"pointer",fontSize:"16px",color:"#6B7280"}}>✕</button>
          </div>
        </div>
        <div style={{padding:"1.5rem"}}>
          <div style={{marginBottom:"1.25rem"}}>
            <div style={{fontSize:"11px",fontWeight:600,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Customer</div>
            <div style={{background:"#F9FAFB",borderRadius:"8px",padding:"12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              {[{label:"Name",value:order.profile?.full_name||"—"},{label:"Email",value:order.profile?.email||"—"},{label:"Phone",value:order.profile?.phone||"—"},{label:"Payment",value:order.payment_method?.toUpperCase()}].map(f=>(
                <div key={f.label}>
                  <div style={{fontSize:"10px",color:"#9CA3AF",marginBottom:"2px"}}>{f.label}</div>
                  <div style={{fontSize:"13px",fontWeight:500,color:"#111827"}}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:"1.25rem",display:"flex",gap:"10px",alignItems:"center"}}>
            <span style={{background:order.payment_status==="paid"?"#D1FAE5":"#FEF3C7",color:order.payment_status==="paid"?"#065F46":"#92400E",padding:"4px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:600}}>
              {order.payment_status==="paid"?"✓ Payment Received":"⏳ Payment Pending"}
            </span>
          </div>
          {address&&(
            <div style={{marginBottom:"1.25rem"}}>
              <div style={{fontSize:"11px",fontWeight:600,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Delivery Address</div>
              <div style={{background:"#F9FAFB",borderRadius:"8px",padding:"12px",fontSize:"13px",color:"#374151",lineHeight:1.8}}>
                <div style={{fontWeight:600,color:"#111827"}}>{address.full_name}</div>
                <div>{address.line1}{address.line2?", "+address.line2:""}</div>
                <div>{address.city}, {address.state} – {address.pincode}</div>
                <div style={{color:"#6B7280"}}>📞 {address.phone}</div>
              </div>
            </div>
          )}
          <div style={{marginBottom:"1.25rem"}}>
            <div style={{fontSize:"11px",fontWeight:600,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Items Ordered</div>
            {(order.items||[]).map((item: any)=>(
              <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}>
                <div>
                  <div style={{fontSize:"14px",fontWeight:500,color:"#111827"}}>{item.product_name}</div>
                  <div style={{fontSize:"12px",color:"#6B7280"}}>Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}</div>
                </div>
                <div style={{fontSize:"14px",fontWeight:600,color:"#6B1A2A"}}>₹{(item.price*item.quantity).toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
          <div style={{background:"#F9FAFB",borderRadius:"8px",padding:"12px",marginBottom:"1.25rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#6B7280",marginBottom:"6px"}}><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString("en-IN")}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#6B7280",marginBottom:"8px"}}><span>Shipping</span><span>{order.shipping===0?"Free":"₹"+order.shipping?.toLocaleString("en-IN")}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"16px",fontWeight:700,color:"#111827",borderTop:"1px solid #E5E7EB",paddingTop:"8px"}}><span>Total</span><span style={{color:"#6B1A2A"}}>₹{order.total?.toLocaleString("en-IN")}</span></div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{fontSize:"12px",color:"#6B7280",fontWeight:500}}>Update Status:</span>
            <select value={order.status} onChange={e=>{updateStatus(order.id,e.target.value);onClose();}}
              style={{flex:1,padding:"8px 12px",fontSize:"13px",border:"1px solid #E5E7EB",borderRadius:"6px",background:"white",cursor:"pointer",color:"#374151"}}>
              {["placed","processing","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerSection({ supabase }: { supabase: any }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingC, setLoadingC] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    async function load() {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, phone, created_at").order("created_at", { ascending: false });
      if (!profiles) { setLoadingC(false); return; }
      const { data: orders } = await supabase.from("orders").select("user_id, total, status");
      const orderMap: Record<string, { count: number; total: number }> = {};
      (orders||[]).forEach((o: any) => {
        if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, total: 0 };
        orderMap[o.user_id].count += 1;
        orderMap[o.user_id].total += o.total || 0;
      });
      setCustomers(profiles.map((p: any) => ({ ...p, orderCount: orderMap[p.id]?.count||0, orderTotal: orderMap[p.id]?.total||0 })));
      setLoadingC(false);
    }
    load();
  }, []);
  if (loadingC) return <div style={{padding:"2rem",color:"#9CA3AF",fontSize:"13px"}}>Loading customers...</div>;
  const filtered = customers.filter(c => !search||(c.full_name||"").toLowerCase().includes(search.toLowerCase())||(c.email||"").toLowerCase().includes(search.toLowerCase()));
  const totalLTV = customers.reduce((s,c)=>s+c.orderTotal,0);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
        <div>
          <h1 style={{fontSize:"22px",fontWeight:600,color:"#111827",margin:0}}>Customers</h1>
          <p style={{fontSize:"13px",color:"#6B7280",margin:"4px 0 0"}}>{customers.length} registered · ₹{totalLTV.toLocaleString("en-IN")} lifetime value</p>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",overflow:"hidden"}}>
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #E5E7EB"}}>
          <input placeholder="🔍  Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",padding:"8px 12px",fontSize:"13px",border:"1px solid #E5E7EB",borderRadius:"6px",outline:"none",background:"#F9FAFB",boxSizing:"border-box"}} />
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
          <thead>
            <tr style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB"}}>
              {["Customer","Email","Phone","Orders","Lifetime Value","Joined"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"11px",fontWeight:600,color:"#6B7280"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:"1px solid #F3F4F6",background:i%2===0?"#fff":"#FAFAFA"}}>
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                    <div style={{width:"32px",height:"32px",borderRadius:"50%",background:"#FDF2F4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:600,color:"#6B1A2A",flexShrink:0}}>
                      {(c.full_name||"?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{fontWeight:500,color:"#111827"}}>{c.full_name||"—"}</div>
                  </div>
                </td>
                <td style={{padding:"12px 14px",color:"#6B7280"}}>{c.email||"—"}</td>
                <td style={{padding:"12px 14px",color:"#6B7280"}}>{c.phone||"—"}</td>
                <td style={{padding:"12px 14px"}}><span style={{background:c.orderCount>0?"#DBEAFE":"#F3F4F6",color:c.orderCount>0?"#1E40AF":"#6B7280",padding:"2px 10px",borderRadius:"4px",fontSize:"12px",fontWeight:600}}>{c.orderCount}</span></td>
                <td style={{padding:"12px 14px",fontWeight:600,color:c.orderTotal>0?"#6B1A2A":"#9CA3AF"}}>{c.orderTotal>0?"₹"+c.orderTotal.toLocaleString("en-IN"):"—"}</td>
                <td style={{padding:"12px 14px",color:"#9CA3AF",fontSize:"12px"}}>{new Date(c.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={6} style={{padding:"2rem",textAlign:"center",color:"#9CA3AF",fontSize:"13px"}}>No customers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReturnsSection({ returns, updateReturnStatus }: { returns: any[], updateReturnStatus: (id:string,status:string,note:string)=>void }) {
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [filter, setFilter] = useState("all");

  const statusColor: any = { requested:"#FEF3C7", approved:"#D1FAE5", rejected:"#FEE2E2", picked_up:"#DBEAFE", refunded:"#D1FAE5" };
  const statusText: any = { requested:"#92400E", approved:"#065F46", rejected:"#991B1B", picked_up:"#1E40AF", refunded:"#065F46" };

  const filtered = filter === "all" ? returns : returns.filter(r => r.status === filter);

  return (
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{fontSize:"22px",fontWeight:600,color:"#111827",margin:0}}>Return Requests</h1>
        <p style={{fontSize:"13px",color:"#6B7280",margin:"4px 0 0"}}>{returns.filter(r=>r.status==="requested").length} pending review · {returns.length} total</p>
      </div>

      {selectedReturn && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}} onClick={()=>setSelectedReturn(null)}>
          <div style={{background:"white",borderRadius:"12px",width:"100%",maxWidth:"520px",padding:"1.75rem",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
              <h2 style={{fontSize:"16px",fontWeight:700,color:"#111827",margin:0}}>Return Request</h2>
              <button onClick={()=>setSelectedReturn(null)} style={{background:"#F3F4F6",border:"none",borderRadius:"6px",width:"32px",height:"32px",cursor:"pointer",fontSize:"16px"}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"1.25rem"}}>
              {[
                {label:"Customer",value:selectedReturn.profile?.full_name||"—"},
                {label:"Email",value:selectedReturn.profile?.email||"—"},
                {label:"Phone",value:selectedReturn.profile?.phone||"—"},
                {label:"Order",value:"#"+(selectedReturn.order_id||"").slice(0,8).toUpperCase()},
                {label:"Product",value:selectedReturn.product_name},
                {label:"Type",value:selectedReturn.type==="return"?"↩ Return & Refund":"🔄 Exchange"},
                {label:"Reason",value:selectedReturn.reason?.replace(/_/g," ")},
                {label:"Submitted",value:new Date(selectedReturn.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})},
              ].map(f=>(
                <div key={f.label} style={{background:"#F9FAFB",borderRadius:"6px",padding:"10px"}}>
                  <div style={{fontSize:"10px",color:"#9CA3AF",marginBottom:"2px",textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.label}</div>
                  <div style={{fontSize:"13px",fontWeight:500,color:"#111827"}}>{f.value}</div>
                </div>
              ))}
            </div>
            {selectedReturn.description && (
              <div style={{background:"#F9FAFB",borderRadius:"6px",padding:"12px",marginBottom:"1.25rem",fontSize:"13px",color:"#374151",lineHeight:1.6}}>
                <div style={{fontSize:"10px",color:"#9CA3AF",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Customer Note</div>
                {selectedReturn.description}
              </div>
            )}
            <div style={{marginBottom:"1rem"}}>
              <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#374151",marginBottom:"6px"}}>Admin Note (shown to customer)</label>
              <textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)} placeholder="e.g. Approved - pickup scheduled for Monday"
                style={{width:"100%",padding:"10px 12px",fontSize:"13px",border:"1px solid #E5E7EB",borderRadius:"6px",outline:"none",minHeight:"70px",resize:"vertical",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}} />
            </div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {selectedReturn.status==="requested" && <>
                <button onClick={()=>{updateReturnStatus(selectedReturn.id,"approved",adminNote);setSelectedReturn(null);}}
                  style={{flex:1,background:"#065F46",color:"white",border:"none",padding:"10px",borderRadius:"6px",fontSize:"13px",fontWeight:500,cursor:"pointer"}}>✓ Approve</button>
                <button onClick={()=>{updateReturnStatus(selectedReturn.id,"rejected",adminNote);setSelectedReturn(null);}}
                  style={{flex:1,background:"#DC2626",color:"white",border:"none",padding:"10px",borderRadius:"6px",fontSize:"13px",fontWeight:500,cursor:"pointer"}}>✕ Reject</button>
              </>}
              {selectedReturn.status==="approved" && (
                <button onClick={()=>{updateReturnStatus(selectedReturn.id,"picked_up",adminNote);setSelectedReturn(null);}}
                  style={{flex:1,background:"#1E40AF",color:"white",border:"none",padding:"10px",borderRadius:"6px",fontSize:"13px",fontWeight:500,cursor:"pointer"}}>📦 Mark Picked Up</button>
              )}
              {selectedReturn.status==="picked_up" && (
                <button onClick={()=>{updateReturnStatus(selectedReturn.id,"refunded",adminNote);setSelectedReturn(null);}}
                  style={{flex:1,background:"#065F46",color:"white",border:"none",padding:"10px",borderRadius:"6px",fontSize:"13px",fontWeight:500,cursor:"pointer"}}>💰 Mark Refunded</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:"8px",marginBottom:"1rem",flexWrap:"wrap"}}>
        {["all","requested","approved","rejected","picked_up","refunded"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{padding:"6px 14px",fontSize:"12px",border:"1px solid",borderColor:filter===s?"#6B1A2A":"#E5E7EB",borderRadius:"20px",background:filter===s?"#6B1A2A":"white",color:filter===s?"white":"#6B7280",cursor:"pointer",fontWeight:filter===s?600:400}}>
            {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1).replace("_"," ")}
            {s!=="all"&&<span style={{marginLeft:"4px",opacity:0.7}}>({returns.filter(r=>r.status===s).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",padding:"3rem",textAlign:"center",color:"#9CA3AF",fontSize:"13px"}}>No return requests{filter!=="all"?` with status "${filter}"`:""}.</div>
      ) : (
        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"10px",overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
            <thead>
              <tr style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB"}}>
                {["Date","Customer","Product","Type","Reason","Status","Action"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"11px",fontWeight:600,color:"#6B7280"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.id} style={{borderBottom:"1px solid #F3F4F6",background:i%2===0?"#fff":"#FAFAFA"}}>
                  <td style={{padding:"12px 14px",color:"#6B7280",fontSize:"12px",whiteSpace:"nowrap"}}>{new Date(r.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{fontWeight:500,color:"#111827"}}>{r.profile?.full_name||"—"}</div>
                    <div style={{fontSize:"11px",color:"#9CA3AF"}}>{r.profile?.email}</div>
                  </td>
                  <td style={{padding:"12px 14px",color:"#374151",maxWidth:"160px"}}>
                    <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.product_name}</div>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{background:r.type==="return"?"#FEF3C7":"#EFF6FF",color:r.type==="return"?"#92400E":"#1E40AF",padding:"2px 8px",borderRadius:"4px",fontSize:"11px",fontWeight:500}}>
                      {r.type==="return"?"↩ Return":"🔄 Exchange"}
                    </span>
                  </td>
                  <td style={{padding:"12px 14px",color:"#6B7280",fontSize:"12px"}}>{r.reason?.replace(/_/g," ")}</td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{background:statusColor[r.status],color:statusText[r.status],padding:"2px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:500}}>
                      {r.status?.charAt(0).toUpperCase()+r.status?.slice(1).replace("_"," ")}
                    </span>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <button onClick={()=>{setSelectedReturn(r);setAdminNote(r.admin_note||"");}}
                      style={{background:"#6B1A2A",color:"white",border:"none",borderRadius:"6px",padding:"4px 12px",fontSize:"12px",cursor:"pointer",fontWeight:500}}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
