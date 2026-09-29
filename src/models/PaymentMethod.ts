export interface PaymentMethod {
  id: number;
  MethodName: string;
  Status?: boolean;
}

export interface Payment {
  id?: number;
  InvoiceID: number;
  MethodID: number;
  TotalPayment: number;
  PaymentDate?: string;

  paymentMethod?: PaymentMethod;
}
