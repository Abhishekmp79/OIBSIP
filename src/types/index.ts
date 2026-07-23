/**
 * Shared TypeScript types for the frontend.
 */

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  verified: boolean;
  addresses?: Address[];
}

export interface Address {
  label?: string;
  line: string;
  city: string;
  pincode: string;
}

export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags?: string[];
}

export interface CustomPizza {
  base: string;
  sauce: string;
  cheese: string;
  vegetables: string[];
}

export interface CartItem {
  /** Stable unique id within the cart. */
  uid: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  custom?: CustomPizza | null;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: 'base' | 'sauce' | 'cheese' | 'vegetable';
  quantity: number;
  threshold: number;
  unit: string;
  lastUpdated?: string;
}

export type OrderStatus =
  | 'Order Received'
  | 'In Kitchen'
  | 'Sent to Delivery'
  | 'Delivered';

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  custom?: CustomPizza | null;
}

export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address?: Partial<Address> & { line?: string; city?: string; pincode?: string };
  notes?: string;
  status: OrderStatus;
  paymentVerified: boolean;
  createdAt: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'Order Received',
  'In Kitchen',
  'Sent to Delivery',
  'Delivered',
];
