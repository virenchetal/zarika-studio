"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label:"Home", full_name:"", phone:"", line1:"", line2:"", city:"", state:"", pincode:"" });
  const router = useRouter();
  const supabase = createClient();
  const subtotal = total();
  const shipping = subtotal >= 2000 ? 0 : 99;
  const grandTotal = subtotal + shipping;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUser(user);
      supabase.from("addresses").select("*").eq("user_id", user.id).then(({ data }) => {
        setAddresses(data || []);
        if (data?.[0]) setSelectedAddress(data[0].id);
      });
    });
  }, []);

  const saveAddress = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").insert({ ...newAddress, user_id: user.id, is_default: addresses.length === 0 }).select().single();
    if (data) { setAddresses([...addresses, data]); setSelectedAddress(data.id); setShowAddAddress(false); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { alert("Please select a delivery address"); return; }
    if (items.length === 0) { alert("Your cart is empty"); return; }
    setPlacing(true);
    const orderItems = items.map(i => ({ order_id: "", product_id: i.product_id, product_name: i.name, product_image: i.image, price: i.price, quantity: i.quantity }));
    const { data: order } = await supabase.from("orders").insert({ user_id: user.id, status: "placed", payment_method: paymentMethod, payment_status: paymentMethod === "cod" ? "pending" : "paid", subtotal, shipping, discount: 0, total: grandTotal, address_id: selectedAddress }).select().single();
    if (order) {
      await supabase.from("order_items").insert(orderItems.map(i => ({ ...i, order_id: order.id })));
      clearCart();
      setStep(3);
    }
    setPlacing(false);
  };

  if (step === 3) return (
    <>
      <Navbar />
      <div style={{minHeight:"70vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F3EDE3"}}>
        <div style={{textAlign:"center",padding:"3rem"}}>
          <div style={{width:"72px",height:"72px",background:"#2D8A3E",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 2rem",fontSize:"28px",color:"white"}}>✓</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"40px",fontWeight:400,color:"#2C2420",marginBottom:"1rem"}}>Order Confirmed!</h1>
          <p style={{fontSize:"14px",color:"#6B635C",marginBottom:"2rem"}}>Thank you for your order. We'll send you an update when it ships.</p>
          <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
            <a href="/profile#orders" style={{background:"#6B1A2A",color:"white",padding:"14px 32px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none"}}>View Orders</a>
            <a href="/shop" style={{background:"none",border:"1.5px solid #6B1A2A",color:"#6B1A2A",padding:"13px 32px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none"}}>Continue Shopping</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{background:"#F3EDE3",minHeight:"80vh",padding:"3rem 2rem"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 380px",gap:"3rem"}}>
          <div>
            {/* Steps */}
            <div style={{display:"flex",marginBottom:"2rem",background:"white",border:"1px solid #EDE6DC",borderRadius:"5px",overflow:"hidden"}}>
              {["Address","Payment","Confirm"].map((s,i)=>(
                <div key={s} style={{flex:1,padding:"14px",textAlign:"center",fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500,background:step===i+1?"#6B1A2A":step>i+1?"#F3EDE3":"white",color:step===i+1?"white":step>i+1?"#B8973C":"#A09890",borderRight:i<2?"1px solid #EDE6DC":"none"}}>
                  {step>i+1?"✓ ":""}{s}
                </div>
              ))}
            </div>

            {/* Step 1 - Address */}
            {step === 1 && (
              <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"5px",padding:"1.5rem"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:400,color:"#2C2420",marginBottom:"1.25rem"}}>Delivery Address</h2>
                {addresses.map(a=>(
                  <div key={a.id} onClick={()=>setSelectedAddress(a.id)} style={{border:`${selectedAddress===a.id?"2px solid #B8973C":"1px solid #EDE6DC"}`,borderRadius:"5px",padding:"1rem 1.25rem",marginBottom:"10px",cursor:"pointer",background:selectedAddress===a.id?"#F5EDD8":"white"}}>
                    <div style={{fontWeight:500,fontSize:"14px",color:"#2C2420",marginBottom:"6px"}}>{a.full_name} ({a.label})</div>
                    <div style={{fontSize:"13px",color:"#6B635C",lineHeight:1.7}}>{a.line1}{a.line2?", "+a.line2:""}<br/>{a.city}, {a.state} – {a.pincode}<br/>{a.phone}</div>
                  </div>
                ))}
                {showAddAddress ? (
                  <div style={{border:"1px solid #EDE6DC",borderRadius:"5px",padding:"1.25rem",marginTop:"10px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                      {[["Full Name","full_name","text"],["Phone","phone","tel"],["Address Line 1","line1","text"],["Address Line 2 (optional)","line2","text"],["City","city","text"],["State","state","text"],["Pincode","pincode","text"],["Label","label","text"]].map(([label,key,type])=>(
                        <div key={key} style={{gridColumn:key==="line1"||key==="label"?"1/-1":"auto"}}>
                          <label style={{display:"block",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"5px"}}>{label}</label>
                          <input type={type} value={(newAddress as any)[key]} onChange={e=>setNewAddress({...newAddress,[key]:e.target.value})}
                            style={{width:"100%",background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"10px 12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}} />
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:"10px",marginTop:"1rem"}}>
                      <button onClick={saveAddress} style={{background:"#6B1A2A",color:"white",border:"none",padding:"10px 24px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",borderRadius:"3px"}}>Save Address</button>
                      <button onClick={()=>setShowAddAddress(false)} style={{background:"none",border:"1px solid #E4DAD0",padding:"10px 20px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",color:"#6B635C"}}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>setShowAddAddress(true)} style={{border:"2px dashed #E4DAD0",borderRadius:"5px",padding:"1rem",width:"100%",background:"none",cursor:"pointer",fontSize:"13px",color:"#A09890",marginTop:"10px"}}>+ Add New Address</button>
                )}
                <button onClick={()=>{ if(selectedAddress||addresses.length===0) setStep(2); }} style={{width:"100%",background:"#6B1A2A",color:"white",border:"none",padding:"15px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",borderRadius:"3px",cursor:"pointer",marginTop:"1.5rem"}}>Continue to Payment</button>
              </div>
            )}

            {/* Step 2 - Payment */}
            {step === 2 && (
              <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"5px",padding:"1.5rem"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:400,color:"#2C2420",marginBottom:"1.25rem"}}>Payment Method</h2>
                {[["upi","UPI Payment","PhonePe · Google Pay · Paytm · BHIM"],["card","Credit / Debit Card","Visa · Mastercard · Rupay · Powered by Razorpay"],["cod","Cash on Delivery","Pay when your order arrives"]].map(([val,label,sub])=>(
                  <div key={val} onClick={()=>setPaymentMethod(val)} style={{border:`${paymentMethod===val?"2px solid #B8973C":"1px solid #EDE6DC"}`,borderRadius:"5px",padding:"1rem 1.25rem",marginBottom:"10px",cursor:"pointer",background:paymentMethod===val?"#F5EDD8":"white",display:"flex",alignItems:"center",gap:"14px"}}>
                    <div style={{width:"20px",height:"20px",borderRadius:"50%",border:`2px solid ${paymentMethod===val?"#B8973C":"#E4DAD0"}`,background:paymentMethod===val?"#B8973C":"white",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {paymentMethod===val&&<div style={{width:"8px",height:"8px",background:"white",borderRadius:"50%"}}/>}
                    </div>
                    <div><div style={{fontSize:"14px",fontWeight:500,color:"#2C2420"}}>{label}</div><div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>{sub}</div></div>
                  </div>
                ))}
                <div style={{display:"flex",gap:"10px",marginTop:"1.5rem"}}>
                  <button onClick={()=>setStep(1)} style={{flex:1,background:"none",border:"1.5px solid #E4DAD0",padding:"14px",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",borderRadius:"3px",cursor:"pointer",color:"#6B635C"}}>← Back</button>
                  <button onClick={placeOrder} disabled={placing} style={{flex:2,background:"#6B1A2A",color:"white",border:"none",padding:"15px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",borderRadius:"3px",cursor:"pointer",opacity:placing?0.7:1}}>
                    {placing?"Placing Order...":"Place Order · ₹"+grandTotal.toLocaleString("en-IN")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"5px",padding:"1.5rem",position:"sticky",top:"84px",alignSelf:"start"}}>
            <p style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"#A09890",marginBottom:"1.25rem",fontWeight:500}}>Order Summary</p>
            {items.map(item=>(
              <div key={item.id} style={{display:"flex",gap:"12px",marginBottom:"1rem",alignItems:"flex-start"}}>
                <div style={{width:"68px",aspectRatio:"3/4",borderRadius:"3px",background:"linear-gradient(145deg,#8B1A35,#C4416A)",flexShrink:0,overflow:"hidden"}}>
                  {item.image&&<img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:"14px",fontWeight:500,color:"#2C2420"}}>{item.name}</p>
                  <p style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>Qty: {item.quantity}</p>
                </div>
                <p style={{fontSize:"14px",color:"#6B1A2A",fontWeight:500}}>₹{(item.price*item.quantity).toLocaleString("en-IN")}</p>
              </div>
            ))}
            <hr style={{border:"none",borderTop:"1px solid #EDE6DC",margin:"1rem 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#6B635C",marginBottom:"7px"}}><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#6B635C",marginBottom:"12px"}}><span>Shipping</span><span style={{color:"#2D8A3E"}}>{shipping===0?"Free":"₹"+shipping}</span></div>
            <hr style={{border:"none",borderTop:"1px solid #EDE6DC",margin:"0 0 12px"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",color:"#2C2420",fontWeight:500}}><span>Total</span><span style={{color:"#6B1A2A"}}>₹{grandTotal.toLocaleString("en-IN")}</span></div>
            <p style={{fontSize:"11px",color:"#A09890",textAlign:"center",marginTop:"1rem"}}>🔒 Secure 256-bit SSL encrypted checkout</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
