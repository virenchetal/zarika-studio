"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TrackPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  const statusColor: any = { placed:"#FEF3C7", processing:"#DBEAFE", shipped:"#E0E7FF", delivered:"#D1FAE5", cancelled:"#FEE2E2", return_initiated:"#F3E8FF", refunded:"#EDE9FE" };
  const statusText: any = { placed:"#92400E", processing:"#1E40AF", shipped:"#3730A3", delivered:"#065F46", cancelled:"#991B1B", return_initiated:"#6D28D9", refunded:"#4C1D95" };
  const steps = [
    { key:"placed", label:"Order Placed", desc:"Your order has been received" },
    { key:"processing", label:"Processing", desc:"We are preparing your saree" },
    { key:"shipped", label:"Shipped", desc:"Your order is on its way" },
    { key:"delivered", label:"Delivered", desc:"Order delivered successfully" },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: o } = await supabase.from("orders").select("*, items:order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
        setOrders(o || []);
      }
      setLoading(false);
    });
  }, []);

  const searchOrder = async () => {
    if (!orderId.trim()) return;
    setSearching(true);
    setNotFound(false);
    setSearchResult(null);
    const cleanId = orderId.trim().replace("#", "").toLowerCase();
    const { data } = await supabase.from("orders").select("*, items:order_items(*)").ilike("id", `${cleanId}%`).limit(1).single();
    setSearching(false);
    if (data) setSearchResult(data);
    else setNotFound(true);
  };

  const OrderTracker = ({ order }: { order: any }) => {
    const stepKeys = ["placed","processing","shipped","delivered"];
    const current = stepKeys.indexOf(order.status);
    return (
      <div style={{border:"1px solid #EDE6DC",borderRadius:"6px",overflow:"hidden",marginBottom:"1rem"}}>
        <div style={{background:"#F3EDE3",padding:"1rem 1.25rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
          <div>
            <div style={{fontWeight:600,fontSize:"14px",color:"#2C2420",fontFamily:"monospace"}}>#{order.id.slice(0,8).toUpperCase()}</div>
            <div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>{new Date(order.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{background:statusColor[order.status]||"#F3F4F6",color:statusText[order.status]||"#374151",padding:"3px 12px",borderRadius:"10px",fontSize:"11px",fontWeight:500}}>
              {order.status?.charAt(0).toUpperCase()+order.status?.slice(1).replace("_"," ")}
            </span>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",color:"#6B1A2A",fontWeight:500}}>₹{order.total?.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div style={{padding:"1.25rem",background:"white"}}>
          {order.items?.map((item: any) => (
            <div key={item.id} style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"10px"}}>
              <div style={{width:"48px",height:"64px",borderRadius:"3px",background:"linear-gradient(145deg,#8B1A35,#C4416A)",flexShrink:0}} />
              <div>
                <div style={{fontSize:"14px",fontWeight:500,color:"#2C2420"}}>{item.product_name}</div>
                <div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
          {!["cancelled","return_initiated","refunded"].includes(order.status) && (
            <div style={{marginTop:"1.25rem",padding:"1rem",background:"#FAF8F3",borderRadius:"4px",border:"1px solid #EDE6DC"}}>
              <div style={{fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"1rem"}}>Tracking</div>
              <div style={{display:"flex",flexDirection:"column"}}>
                {steps.map((step, i) => {
                  const stepIdx = stepKeys.indexOf(step.key);
                  const done = stepIdx <= current;
                  const active = stepIdx === current;
                  return (
                    <div key={step.key} style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                        <div style={{width:"20px",height:"20px",borderRadius:"50%",background:done?"#6B1A2A":"#E4DAD0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {done && <span style={{color:"white",fontSize:"10px"}}>✓</span>}
                        </div>
                        {i < 3 && <div style={{width:"2px",height:"28px",background:stepIdx < current?"#6B1A2A":"#E4DAD0"}} />}
                      </div>
                      <div style={{paddingBottom:"16px"}}>
                        <div style={{fontSize:"13px",fontWeight:active?600:400,color:done?"#2C2420":"#A09890"}}>{step.label}</div>
                        {active && <div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>{step.desc}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {order.status === "cancelled" && (
            <div style={{marginTop:"1rem",padding:"10px",background:"#FEE2E2",borderRadius:"4px",fontSize:"13px",color:"#991B1B"}}>This order was cancelled.</div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{color:"#A09890",fontFamily:"'Cormorant Garamond',serif",fontSize:"20px"}}>Loading...</p>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{background:"#F3EDE3",minHeight:"80vh",padding:"2rem 1.5rem"}}>
        <div style={{maxWidth:"720px",margin:"0 auto"}}>
          <p style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#B8973C",marginBottom:"8px"}}>Tracking</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"36px",fontWeight:400,color:"#2C2420",marginBottom:"0.5rem"}}>Track Your Order</h1>
          <p style={{fontSize:"13px",color:"#A09890",marginBottom:"2rem"}}>Enter your Order ID to track your order status.</p>

          <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",marginBottom:"2rem"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"8px",fontWeight:500}}>Order ID</label>
            <div style={{display:"flex",gap:"10px"}}>
              <input value={orderId} onChange={e=>setOrderId(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&searchOrder()}
                placeholder="e.g. 3B59F4CD"
                style={{flex:1,background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"11px 14px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",outline:"none"}} />
              <button onClick={searchOrder} disabled={searching}
                style={{background:"#6B1A2A",color:"white",border:"none",padding:"11px 24px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",borderRadius:"3px",opacity:searching?0.7:1,whiteSpace:"nowrap"}}>
                {searching?"Searching...":"Track"}
              </button>
            </div>
            <p style={{fontSize:"11px",color:"#A09890",marginTop:"8px"}}>Your Order ID can be found in your order confirmation email or in My Orders if you have an account.</p>
            {notFound && (
              <div style={{marginTop:"12px",padding:"10px 14px",background:"#FEE2E2",borderRadius:"4px",fontSize:"13px",color:"#991B1B"}}>
                No order found with that ID. Please check and try again.
              </div>
            )}
          </div>

          {searchResult && (
            <div style={{marginBottom:"2rem"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:400,color:"#2C2420",marginBottom:"1rem"}}>Order Found</h2>
              <OrderTracker order={searchResult} />
            </div>
          )}

          {user && orders.length > 0 && (
            <div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:400,color:"#2C2420",marginBottom:"1rem"}}>Your Recent Orders</h2>
              {orders.slice(0,5).map(order => <OrderTracker key={order.id} order={order} />)}
              {orders.length > 5 && (
                <a href="/profile#orders" style={{display:"block",textAlign:"center",color:"#B8973C",fontSize:"13px",marginTop:"1rem",textDecoration:"underline"}}>
                  View all {orders.length} orders →
                </a>
              )}
            </div>
          )}

          {!user && (
            <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",textAlign:"center"}}>
              <p style={{fontSize:"14px",color:"#6B635C",marginBottom:"1rem"}}>Have an account? Sign in to see all your orders automatically.</p>
              <a href="/profile" style={{background:"#6B1A2A",color:"white",padding:"10px 24px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",textDecoration:"none",borderRadius:"3px"}}>Sign In</a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
