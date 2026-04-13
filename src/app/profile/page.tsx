"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [section, setSection] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["profile","orders","addresses"].includes(hash)) return hash;
    }
    return "profile";
  });
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({ label:"Home", full_name:"", phone:"", line1:"", line2:"", city:"", state:"", pincode:"", is_default:false });
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [form, setForm] = useState({ full_name:"", email:"", phone:"" });
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["profile","orders","addresses"].includes(hash)) setSection(hash);
  }, []);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUser(user);
      const { data: p, error: pErr } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      console.log("Profile fetch:", p, pErr);
      setProfile(p);
      setForm({ full_name: p?.full_name||"", email: p?.email||user.email||"", phone: p?.phone||"" });
      const { data: o } = await supabase.from("orders").select("*, items:order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
      setOrders(o || []);
      const { data: a } = await supabase.from("addresses").select("*").eq("user_id", user.id);
      setAddresses(a || []);
    });
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...form, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (!error) {
      setProfile({ ...profile, ...form });
    }
    setSaving(false);
    alert("Profile updated successfully!");
  };

  const saveAddress = async () => {
    if (!user) return;
    if (!addressForm.full_name || !addressForm.line1 || !addressForm.city || !addressForm.pincode) { alert("Please fill all required fields."); return; }
    if (editingAddress) {
      const { error } = await supabase.from("addresses").update({ ...addressForm, updated_at: new Date().toISOString() }).eq("id", editingAddress.id);
      if (!error) {
        setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...a, ...addressForm } : a));
        setEditingAddress(null); setShowAddressForm(false);
      }
    } else {
      const { data, error } = await supabase.from("addresses").insert({ ...addressForm, user_id: user.id }).select().single();
      if (!error && data) { setAddresses([...addresses, data]); setShowAddressForm(false); }
    }
    setAddressForm({ label:"Home", full_name:"", phone:"", line1:"", line2:"", city:"", state:"", pincode:"", is_default:false });
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const setDefault = async (id: string) => {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
  };

  const startEdit = (a: any) => {
    setAddressForm({ label:a.label||"Home", full_name:a.full_name||"", phone:a.phone||"", line1:a.line1||"", line2:a.line2||"", city:a.city||"", state:a.state||"", pincode:a.pincode||"", is_default:a.is_default||false });
    setEditingAddress(a); setShowAddressForm(true);
  };

  const statusColor: any = { placed:"#FEF3C7", processing:"#DBEAFE", shipped:"#E0E7FF", delivered:"#D1FAE5", cancelled:"#FEE2E2" };
  const statusText: any = { placed:"#92400E", processing:"#1E40AF", shipped:"#3730A3", delivered:"#065F46", cancelled:"#991B1B" };

  const navItems = [
    { id:"profile", label:"My Profile", icon:"👤" },
    { id:"orders", label:"My Orders", icon:"📦" },
    { id:"addresses", label:"Addresses", icon:"📍" },
  ];

  if (!user) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><p>Loading...</p></div>;

  return (
    <>
      <Navbar />
      <div style={{background:"#F3EDE3",minHeight:"80vh",padding:"2rem"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"grid",gridTemplateColumns:"260px 1fr",gap:"2rem",alignItems:"start"}}>
          {/* Sidebar */}
          <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(135deg,#6B1A2A,#8B2238)",padding:"2rem",textAlign:"center"}}>
              <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",color:"white"}}>
                {(profile?.full_name||"U").charAt(0).toUpperCase()}
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",color:"white",fontWeight:400}}>{profile?.full_name||"Customer"}</div>
              <div style={{fontSize:"12px",color:"rgba(255,255,255,0.6)",marginTop:"4px"}}>{profile?.email||user?.email}</div>
            </div>
            {navItems.map(item=>(
              <button key={item.id} onClick={()=>setSection(item.id)}
                style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 1.25rem",fontSize:"13px",color:section===item.id?"#6B1A2A":"#6B635C",background:section===item.id?"#F9F0F2":"none",border:"none",borderBottom:"1px solid #EDE6DC",borderLeft:section===item.id?"3px solid #6B1A2A":"3px solid transparent",cursor:"pointer",width:"100%",textAlign:"left",fontFamily:"'DM Sans',sans-serif",fontWeight:section===item.id?500:400}}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
            <button onClick={async()=>{await supabase.auth.signOut();router.push("/");}}
              style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 1.25rem",fontSize:"13px",color:"#C0392B",background:"none",border:"none",cursor:"pointer",width:"100%",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
              <span>←</span> Sign Out
            </button>
          </div>

          {/* Content */}
          <div>
            {/* Profile */}
            {section === "profile" && (
              <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.75rem"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",fontWeight:400,color:"#2C2420",marginBottom:"0.5rem"}}>Personal Information</h2>
                <p style={{fontSize:"13px",color:"#A09890",marginBottom:"1.75rem"}}>Update your name, email and phone number</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                  {[["Full Name","full_name","text"],["Email Address","email","email"],["Phone Number","phone","tel"]].map(([label,key,type])=>(
                    <div key={key} style={{gridColumn:key==="full_name"?"1/-1":"auto"}}>
                      <label style={{display:"block",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"6px",fontWeight:500}}>{label}</label>
                      <input type={type} value={(form as any)[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                        style={{width:"100%",background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"11px 14px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}} />
                    </div>
                  ))}
                </div>
                <div style={{marginTop:"1.5rem",paddingTop:"1.5rem",borderTop:"1px solid #EDE6DC",display:"flex",gap:"12px"}}>
                  <button onClick={saveProfile} disabled={saving} style={{background:"#6B1A2A",color:"white",border:"none",padding:"11px 24px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",borderRadius:"3px",opacity:saving?0.7:1}}>
                    {saving?"Saving...":"Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Orders */}
            {section === "orders" && (
              <div>
                <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",marginBottom:"1.25rem"}}>
                  <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",fontWeight:400,color:"#2C2420",marginBottom:"0.25rem"}}>My Orders</h2>
                  <p style={{fontSize:"13px",color:"#A09890"}}>Track and manage your purchases</p>
                </div>
                {orders.length === 0 ? (
                  <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"3rem",textAlign:"center"}}>
                    <p style={{fontSize:"48px",marginBottom:"1rem"}}>📦</p>
                    <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",color:"#2C2420",marginBottom:"8px"}}>No orders yet</p>
                    <p style={{fontSize:"13px",color:"#A09890",marginBottom:"1.5rem"}}>Start shopping to see your orders here</p>
                    <a href="/shop" style={{background:"#B8973C",color:"#1A1614",padding:"12px 28px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none"}}>Shop Now</a>
                  </div>
                ) : orders.map(order=>(
                  <div key={order.id} style={{border:"1px solid #EDE6DC",borderRadius:"6px",overflow:"hidden",marginBottom:"1rem"}}>
                    <div style={{background:"#F3EDE3",padding:"1rem 1.25rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
                      <div>
                        <div style={{fontWeight:500,fontSize:"14px",color:"#2C2420"}}>#{order.id.slice(0,8).toUpperCase()}</div>
                        <div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>{new Date(order.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                        <span style={{background:statusColor[order.status]||"#F3F4F6",color:statusText[order.status]||"#374151",padding:"3px 12px",borderRadius:"10px",fontSize:"11px",fontWeight:500}}>{order.status}</span>
                        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",color:"#6B1A2A",fontWeight:500}}>₹{order.total?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div style={{padding:"1.25rem",background:"white"}}>
                      {order.items?.map((item: any)=>(
                        <div key={item.id} style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"10px"}}>
                          <div style={{width:"48px",height:"64px",borderRadius:"3px",background:"linear-gradient(145deg,#8B1A35,#C4416A)",flexShrink:0,overflow:"hidden"}}>
                            {item.product_image&&<img src={item.product_image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                          </div>
                          <div>
                            <div style={{fontSize:"14px",fontWeight:500,color:"#2C2420"}}>{item.product_name}</div>
                            <div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{marginTop:"1rem",display:"flex",gap:"10px"}}>
                        <button onClick={()=>setTrackingOrder(trackingOrder?.id===order.id?null:order)} style={{background:trackingOrder?.id===order.id?"#6B1A2A":"none",color:trackingOrder?.id===order.id?"white":"#6B635C",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"6px 14px",fontSize:"12px",cursor:"pointer"}}>
  {trackingOrder?.id===order.id?"Hide Tracking":"Track Order"}
</button>
                        {order.status==="delivered"&&<button style={{background:"none",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"6px 14px",fontSize:"12px",color:"#6B635C",cursor:"pointer"}}>Return / Exchange</button>}
                      </div>
                      {trackingOrder?.id===order.id&&(
                        <div style={{marginTop:"1rem",padding:"1rem",background:"#FAF8F3",borderRadius:"4px",border:"1px solid #EDE6DC"}}>
                          <div style={{fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"1rem"}}>Order Status</div>
                          <div style={{display:"flex",flexDirection:"column",gap:"0"}}>
                            {[
                              {key:"placed",label:"Order Placed",desc:"Your order has been received"},
                              {key:"processing",label:"Processing",desc:"We are preparing your saree"},
                              {key:"shipped",label:"Shipped",desc:"Your order is on its way"},
                              {key:"delivered",label:"Delivered",desc:"Order delivered successfully"},
                            ].map((step,i)=>{
                              const steps=["placed","processing","shipped","delivered"];
                              const current=steps.indexOf(order.status);
                              const stepIdx=steps.indexOf(step.key);
                              const done=stepIdx<=current;
                              const active=stepIdx===current;
                              return (
                                <div key={step.key} style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
                                  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                                    <div style={{width:"20px",height:"20px",borderRadius:"50%",background:done?"#6B1A2A":"#E4DAD0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                      {done&&<span style={{color:"white",fontSize:"10px"}}>✓</span>}
                                    </div>
                                    {i<3&&<div style={{width:"2px",height:"28px",background:stepIdx<current?"#6B1A2A":"#E4DAD0"}}/>}
                                  </div>
                                  <div style={{paddingBottom:"16px"}}>
                                    <div style={{fontSize:"13px",fontWeight:active?600:400,color:done?"#2C2420":"#A09890"}}>{step.label}</div>
                                    {active&&<div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>{step.desc}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {order.status==="cancelled"&&<div style={{padding:"10px",background:"#FEE2E2",borderRadius:"4px",fontSize:"13px",color:"#991B1B"}}>This order was cancelled.</div>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Addresses */}
            {section === "addresses" && (
              <div>
                <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",marginBottom:"1.25rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",fontWeight:400,color:"#2C2420",margin:0}}>Saved Addresses</h2>
                  <button onClick={()=>{setEditingAddress(null);setAddressForm({label:"Home",full_name:"",phone:"",line1:"",line2:"",city:"",state:"",pincode:"",is_default:false});setShowAddressForm(!showAddressForm);}} style={{background:"#6B1A2A",color:"white",border:"none",padding:"8px 18px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",borderRadius:"3px"}}>
                    {showAddressForm?"Cancel":"+ Add Address"}
                  </button>
                </div>

                {showAddressForm&&(
                  <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",marginBottom:"1.25rem"}}>
                    <h3 style={{fontSize:"13px",fontWeight:600,color:"#2C2420",marginBottom:"1.2rem",textTransform:"uppercase",letterSpacing:"1px"}}>{editingAddress?"Edit Address":"New Address"}</h3>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                      {[
                        {label:"Label",key:"label",ph:"Home / Office / Other",full:false},
                        {label:"Full Name *",key:"full_name",ph:"Name on delivery",full:false},
                        {label:"Phone *",key:"phone",ph:"10-digit mobile number",full:false},
                        {label:"Address Line 1 *",key:"line1",ph:"Flat, House no., Building",full:true},
                        {label:"Address Line 2",key:"line2",ph:"Area, Colony, Street",full:true},
                        {label:"City *",key:"city",ph:"City",full:false},
                        {label:"State *",key:"state",ph:"State",full:false},
                        {label:"Pincode *",key:"pincode",ph:"6-digit pincode",full:false},
                      ].map(f=>(
                        <div key={f.key} style={{gridColumn:f.full?"1/-1":"auto"}}>
                          <label style={{display:"block",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"6px"}}>{f.label}</label>
                          <input value={(addressForm as any)[f.key]} onChange={e=>setAddressForm({...addressForm,[f.key]:e.target.value})} placeholder={f.ph}
                            style={{width:"100%",background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"10px 12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}} />
                        </div>
                      ))}
                    </div>
                    <label style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"1rem",fontSize:"13px",color:"#2C2420",cursor:"pointer"}}>
                      <input type="checkbox" checked={addressForm.is_default} onChange={e=>setAddressForm({...addressForm,is_default:e.target.checked})} style={{width:"16px",height:"16px",accentColor:"#6B1A2A"}} />
                      Set as default address
                    </label>
                    <div style={{marginTop:"1.25rem",display:"flex",gap:"10px"}}>
                      <button onClick={saveAddress} style={{background:"#6B1A2A",color:"white",border:"none",padding:"10px 24px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",borderRadius:"3px"}}>
                        {editingAddress?"Update Address":"Save Address"}
                      </button>
                      <button onClick={()=>{setShowAddressForm(false);setEditingAddress(null);}} style={{background:"none",border:"1px solid #E4DAD0",color:"#6B635C",padding:"10px 18px",fontSize:"11px",cursor:"pointer",borderRadius:"3px"}}>Cancel</button>
                    </div>
                  </div>
                )}

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                  {addresses.map(a=>(
                    <div key={a.id} style={{background:"white",border:a.is_default?"1px solid #B8973C":"1px solid #EDE6DC",borderRadius:"6px",padding:"1.25rem",borderLeft:a.is_default?"3px solid #B8973C":"1px solid #EDE6DC"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                          {a.is_default&&<span style={{fontSize:"10px",background:"#B8973C",color:"white",padding:"2px 8px",borderRadius:"10px"}}>Default</span>}
                          <span style={{fontSize:"11px",color:"#A09890",textTransform:"uppercase",letterSpacing:"0.5px"}}>{a.label}</span>
                        </div>
                        <div style={{display:"flex",gap:"8px"}}>
                          <button onClick={()=>startEdit(a)} style={{fontSize:"11px",color:"#6B635C",background:"none",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"3px 10px",cursor:"pointer"}}>Edit</button>
                          <button onClick={()=>deleteAddress(a.id)} style={{fontSize:"11px",color:"#DC2626",background:"none",border:"1px solid #FCA5A5",borderRadius:"3px",padding:"3px 10px",cursor:"pointer"}}>Delete</button>
                        </div>
                      </div>
                      <div style={{fontWeight:500,fontSize:"14px",color:"#2C2420",marginBottom:"4px"}}>{a.full_name}</div>
                      <div style={{fontSize:"13px",color:"#6B635C",lineHeight:1.7}}>{a.line1}{a.line2&&<>, {a.line2}</>}<br/>{a.city}, {a.state} – {a.pincode}<br/>{a.phone}</div>
                      {!a.is_default&&<button onClick={()=>setDefault(a.id)} style={{marginTop:"10px",fontSize:"11px",color:"#B8973C",background:"none",border:"1px solid #B8973C",borderRadius:"3px",padding:"4px 12px",cursor:"pointer"}}>Set as Default</button>}
                    </div>
                  ))}
                  {addresses.length===0&&!showAddressForm&&<div style={{gridColumn:"1/-1",background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"2rem",textAlign:"center",color:"#A09890",fontSize:"13px"}}>No saved addresses yet.</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
