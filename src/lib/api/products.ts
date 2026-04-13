import { createClient } from "@/lib/supabase/server";

export async function getProducts(filters?: {
  category?: string;
  fabric?: string;
  minPrice?: number;
  maxPrice?: number;
  occasion?: string;
  sort?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(`*, category:categories(id,name,slug), images:product_images(id,url,storage_path,sort_order,is_primary)`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters?.featured) query = query.eq("is_featured", true);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.minPrice) query = query.gte("price", filters.minPrice);
  if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters?.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (filters?.sort === "price_desc") query = query.order("price", { ascending: false });

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`*, category:categories(id,name,slug), images:product_images(id,url,storage_path,sort_order,is_primary)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data || [];
}
