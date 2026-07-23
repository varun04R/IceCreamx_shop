export type Role = 'admin' | 'manager' | 'cashier' | 'employee' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  phone: string;
  avatar_url: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
}

export type Size = 'small' | 'medium' | 'large' | 'family';

export interface IceCream {
  id: string;
  name: string;
  category_id: string | null;
  flavor: string;
  description: string;
  ingredients: string[];
  calories: number;
  price: number;
  discount: number;
  stock: number;
  sku: string;
  barcode: string;
  image_url: string;
  sizes: Size[];
  availability: boolean;
  seasonal: boolean;
  featured: boolean;
  best_seller: boolean;
  created_at: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  image_url: string;
  available: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  supplier: string;
  purchase_date: string | null;
  expiry_date: string | null;
  min_stock: number;
  category: string;
  updated_at: string;
}

export type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthday: string | null;
  favorite_flavor: string;
  reward_points: number;
  membership_level: MembershipLevel;
  created_at: string;
}

export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing' | 'ready'
  | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  toppings?: string[];
  image_url?: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  status: OrderStatus;
  notes: string;
  created_by: string | null;
  created_at: string;
}

export type CouponType = 'flat' | 'percentage' | 'bogo';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  active: boolean;
  expires_at: string | null;
}

export interface Review {
  id: string;
  ice_cream_id: string;
  customer_id: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  image_url: string;
  likes: number;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
