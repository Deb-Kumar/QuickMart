export interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  itemCount?: number;
}

export interface NutritionInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  unit: string;
  time: string;
  rating: number;
  reviewsCount: number;
  description: string;
  badge?: string;
  nutrition?: NutritionInfo;
  inStock: boolean;
  shelfLife?: string;
  origin?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  tip: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  etaMinutes: number;
  elapsedSeconds: number;
  address: string;
  paymentMethod: string;
  deliveryInstructions: string;
  promoCode?: string;
  rider: {
    name: string;
    phone: string;
    avatar: string;
    vehicle: string;
    rating: number;
  };
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  description: string;
}
