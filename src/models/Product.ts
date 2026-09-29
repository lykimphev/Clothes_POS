import type { Category } from './Category';
import type { Brand } from './Brand';

export interface ProductVariant {
  id: number;
  product_id: number;
  sku?: string;
  barcode?: string;
  attributes?: {
    Color?: string;
    Size?: string;
    [key: string]: any;
  };
  cost: number;
  selling_price: number;
  current_stock: number;
  minimum_stock?: number;
  image?: string;
  status?: boolean;
}

export interface Product {
  id: number;
  name: string;
  product_code?: string;
  category_id?: number;
  brand_id?: number;
  thumbnail?: string;
  short_description?: string;
  description?: string;
  type: string;
  tax_rate?: number;
  status?: boolean;

  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
}
