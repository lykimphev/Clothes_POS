import type { Customer } from './Customer';
import type { Product } from './Product';

export interface InvoiceDetail {
  id?: number;
  InvoiceID?: number;
  ProductID: number;
  qty: number;
  price: number;
  cost: number;
  totalPay: number;
  discount?: number;
  product?: Product;
}

export interface Invoice {
  id?: number;
  CustomerID: number;
  UserID: number;
  ExchangeID: number;
  invoiceDate?: string;
  discount?: number;
  points_earned: number;
  points_redeemed: number;
  points_discount_amount: number;
  total: number;
  status: boolean | number;

  customer?: Customer;
  details?: InvoiceDetail[];
}
