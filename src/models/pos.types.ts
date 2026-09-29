export interface AttributeValue {
    id: number;
    value: string;
    attribute?: {
        id: number;
        name: string;
    };
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string;
    barcode: string;
    selling_price?: number | string;
    price?: number | string;
    cost: number | string;
    current_stock: number;
    attributes?: Record<string, string> | any;
    attribute_values?: AttributeValue[];
    image?: string | null;
    image_url?: string | null;
}

export interface Category {
    id: number;
    name: string;
    status: number;
}

export interface Product {
    id: number;
    product_code: string;
    name: string;
    image: string | null;
    image_url: string | null;
    status: number;
    category_id: number;
    category?: Category;
    brand?: {
        id: number;
        name: string;
    };
    variants: ProductVariant[];
}

export interface CartItem {
    id: number;
    variant_id: number;
    name: string;
    sku: string;
    barcode: string;
    variant_name: string;
    image_url: string | null;
    price: number;
    cost: number;
    quantity: number;
    max_stock: number;
}

export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    points: number;
    total_spent: number;
    tier?: string;
}

export interface ExchangeRate {
    id: number;
    rate: number;
    fromCurrency?: { code: string; symbol: string };
    toCurrency?: { code: string; symbol: string };
}

export interface PaymentMethod {
    id: number;
    MethodName: string;
    Status: number;
}

export interface CashierUser {
    id: number;
    name: string;
    email: string;
    role?: {
        id: number;
        name: string;
    };
}

export interface PosBootstrapData {
    products: Product[];
    categories: Category[];
    exchanges: ExchangeRate[];
    payment_methods: PaymentMethod[];
    cashiers: CashierUser[];
    customers: Customer[];
    store_info: {
        name: string;
        city: string;
        bank_name: string;
        account_id: string;
    };
}

export interface InvoiceDetail {
    id: number;
    InvoiceID: number;
    ProductID: number;
    qty: number;
    price: number;
    cost: number;
    totalPay: number;
    discount: number;
    product?: Product;
}

export interface Invoice {
    id: number;
    invoiceDate: string;
    discount: number;
    total: number;
    points_earned: number;
    points_redeemed: number;
    points_discount_amount: number;
    status: number;
    CustomerID: number;
    UserID: number;
    ExchangeID: number | null;
    customer?: Customer;
    user?: CashierUser;
    exchange?: ExchangeRate;
    details?: InvoiceDetail[];
    payments?: Array<{
        id: number;
        MethodID: number;
        TotalPayment: number;
        payment_method?: PaymentMethod;
    }>;
}

export interface CheckoutPayload {
    cart_items: Array<{
        id: number;
        variant_id: number;
        quantity: number;
        price: number;
    }>;
    user_id: number;
    customer_type: 'General Customer' | 'Special Customer';
    customer_name: string;
    customer_phone: string;
    exchange_id: number | null;
    discount: number;
    payment_method_id: number;
    total_usd: number;
    redeem_points: number;
    points_discount_usd: number;
}
