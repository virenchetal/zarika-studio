import { createClient } from "@/lib/supabase/server";

export async function createOrder(params: any) {
  const supabase = await createClient();
  const subtotal = params.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 99;
  const total = subtotal + shipping - (params.discount || 0);
  const { data: order, error } = await supabase
    .from("orders")
    .insert({ user_id: params.userId, status: "placed", payment_method: params.paymentMethod, payment_status: params.paymentMethod === "cod" ? "pending" : "paid", subtotal, shipping, discount: params.discount || 0, total, address_id: params.addressId })
    .select().single();
  if (error || !order) return null;
  await supabase.from("order_items").insert(
    params.items.map((item: any) => ({ order_id: order.id, product_id: item.product_id, product_name: item.name, product_image: item.image, price: item.price, quantity: item.quantity }))
  );
  return order;
}

export async function getUserOrders(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select(`*, items:order_items(*), address:addresses(*)`).eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}

export async function getAllOrders() {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select(`*, items:order_items(*), address:addresses(*), profile:profiles(full_name,phone,email)`).order("created_at", { ascending: false });
  return data || [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
  return !error;
}
