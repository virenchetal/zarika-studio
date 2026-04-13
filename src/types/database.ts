export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id" | "created_at">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id">;
        Update: Partial<Omit<OrderItem, "id">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, "id" | "created_at">;
        Update: Partial<Omit<Address, "id" | "created_at">>;
      };
      wishlist: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, "id" | "created_at">;
        Update: never;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, "id">;
        Update: Partial<Omit<ProductImage, "id">>;
      };
    };
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  fabric: string | null;
  color: string | null;
  occasion: string | null;
  length_meters: number | null;
  blouse_piece: string | null;
  care_instructions: string | null;
  stock_quantity: number;
  sku: string | null;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  badge: "new" | "sale" | "bridal" | null;
  delivery_days: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  storage_path: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  payment_method: "upi" | "card" | "cod";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  items?: OrderItem[];
  address?: Address;
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  // Joined
  product?: Product;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  mrp: number | null;
  image: string | null;
  color: string | null;
  quantity: number;
}
