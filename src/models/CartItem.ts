import type { Product, ProductVariant } from './Product';

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  price: number;
  cost: number;
  subtotal: number;
}
