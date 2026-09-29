import React, { useState, useEffect, useRef } from 'react';
import { posService } from '../services/posService';
import { PosHeader } from '../components/pos/PosHeader';
import { ProductCard } from '../components/pos/ProductCard';
import { VariantModal } from '../components/pos/VariantModal';
import { CartPanel } from '../components/pos/CartPanel';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { ThermalReceiptModal } from '../components/pos/ThermalReceiptModal';
import { QuickCustomerModal } from '../components/pos/QuickCustomerModal';
import type { 
    Product, 
    ProductVariant, 
    Category, 
    CartItem, 
    Customer, 
    ExchangeRate, 
    PaymentMethod, 
    CashierUser,
    Invoice 
} from '../models/pos.types';

export const HomePage: React.FC = () => {
    // Bootstrap Data
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [exchanges, setExchanges] = useState<ExchangeRate[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [cashiers, setCashiers] = useState<CashierUser[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Active Cashier & Rate
    const [activeCashierId, setActiveCashierId] = useState<number>(1);
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Cart State
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('pos_react_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [customerType, setCustomerType] = useState<'General Customer' | 'Special Customer'>('General Customer');
    const [customerPhone, setCustomerPhone] = useState<string>('');
    const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
    const [usePoints, setUsePoints] = useState<boolean>(false);

    // Modals
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
    const [showVariantModal, setShowVariantModal] = useState<boolean>(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
    const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
    const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
    const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Save cart to local storage
    useEffect(() => {
        localStorage.setItem('pos_react_cart', JSON.stringify(cart));
    }, [cart]);

    // Load initial POS data from backend
    useEffect(() => {
        loadPosData();
    }, []);

    const loadPosData = async () => {
        setLoading(true);
        try {
            const res = await posService.getInitData();
            if (res.status === 'success' && res.data) {
                setProducts(res.data.products);
                setCategories(res.data.categories);
                setExchanges(res.data.exchanges);
                setPaymentMethods(res.data.payment_methods);
                setCashiers(res.data.cashiers);
                setCustomers(res.data.customers);

                if (res.data.cashiers.length > 0) {
                    setActiveCashierId(res.data.cashiers[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to load POS data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Customer Lookup
    useEffect(() => {
        if (customerType === 'Special Customer' && customerPhone.trim().length >= 3) {
            const found = customers.find(c => c.phone?.trim() === customerPhone.trim());
            setActiveCustomer(found || null);
        } else {
            setActiveCustomer(null);
            setUsePoints(false);
        }
    }, [customerPhone, customerType, customers]);

    // Barcode scanner listener on search input
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchQuery.trim().toLowerCase();
            if (!query) return;

            // Search by barcode / SKU / code
            for (const prod of products) {
                const foundVariant = prod.variants.find(v => 
                    v.barcode?.toLowerCase() === query || 
                    v.sku?.toLowerCase() === query
                );
                if (foundVariant) {
                    addProductToCart(prod, foundVariant);
                    setSearchQuery('');
                    return;
                }
            }

            // If only one product matches by code/name, add it
            const matchedProducts = products.filter(p => 
                p.product_code?.toLowerCase() === query || 
                p.name?.toLowerCase().includes(query)
            );

            if (matchedProducts.length === 1) {
                handleProductCardClick(matchedProducts[0]);
                setSearchQuery('');
            }
        }
    };

    // Keyboard Shortcuts (F4: Checkout, F9: Clear, /: Search)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F4') {
                e.preventDefault();
                if (cart.length > 0) setShowCheckoutModal(true);
            } else if (e.key === 'F9') {
                e.preventDefault();
                handleClearCart();
            } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart]);

    const handleProductCardClick = (product: Product) => {
        if (product.variants.length === 1) {
            addProductToCart(product, product.variants[0]);
        } else if (product.variants.length > 1) {
            setSelectedProductForVariant(product);
            setShowVariantModal(true);
        }
    };

    const addProductToCart = (product: Product, variant: ProductVariant) => {
        if ((variant.current_stock || 0) <= 0) {
            alert('This item is currently out of stock!');
            return;
        }

        let variantName = variant.sku || 'Standard';
        if (variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)) {
            variantName = Object.values(variant.attributes).join(' / ');
        } else if (variant.attribute_values && Array.isArray(variant.attribute_values) && variant.attribute_values.length > 0) {
            variantName = variant.attribute_values.map(av => av.value).join(' / ');
        }

        setCart(prev => {
            const existingIndex = prev.findIndex(item => item.variant_id === variant.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                const newQty = updated[existingIndex].quantity + 1;
                if (newQty > variant.current_stock) {
                    alert(`Only ${variant.current_stock} items available in stock!`);
                    return prev;
                }
                updated[existingIndex].quantity = newQty;
                return updated;
            } else {
                return [...prev, {
                    id: product.id,
                    variant_id: variant.id,
                    name: product.name,
                    sku: variant.sku,
                    barcode: variant.barcode,
                    variant_name: variantName,
                    image_url: product.image_url,
                    price: Number(variant.selling_price ?? variant.price ?? 0),
                    cost: Number(variant.cost ?? 0),
                    quantity: 1,
                    max_stock: variant.current_stock,
                }];
            }
        });

        setShowVariantModal(false);
    };

    const handleUpdateQuantity = (variantId: number, qty: number) => {
        if (qty <= 0) {
            handleRemoveItem(variantId);
            return;
        }
        setCart(prev => prev.map(item => {
            if (item.variant_id === variantId) {
                if (qty > item.max_stock) {
                    alert(`Maximum stock is ${item.max_stock}`);
                    return item;
                }
                return { ...item, quantity: qty };
            }
            return item;
        }));
    };

    const handleRemoveItem = (variantId: number) => {
        setCart(prev => prev.filter(item => item.variant_id !== variantId));
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm('Are you sure you want to clear the current cart?')) {
            setCart([]);
            setDiscountPercent(0);
            setUsePoints(false);
        }
    };

    const handlePaymentSubmit = async (payload: any, shouldPrint: boolean) => {
        try {
            const res = await posService.checkout(payload);
            if (res.status === 'success' && res.invoice) {
                setCart([]);
                setDiscountPercent(0);
                setUsePoints(false);
                setCustomerPhone('');
                setShowCheckoutModal(false);

                // Update product stock locally
                loadPosData();

                if (shouldPrint) {
                    setCompletedInvoice(res.invoice);
                    setShowReceiptModal(true);
                } else {
                    alert('Sale completed successfully!');
                }
            } else {
                alert('Checkout failed: ' + (res.message || 'Unknown error'));
            }
        } catch (err: any) {
            alert('Server error during checkout: ' + (err.response?.data?.message || err.message));
        }
    };

    const currentExchange = exchanges[0] || null;
    const rateVal = currentExchange ? currentExchange.rate : 4100;

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q || 
            p.name.toLowerCase().includes(q) || 
            p.product_code?.toLowerCase().includes(q) ||
            p.variants.some(v => v.sku?.toLowerCase().includes(q) || v.barcode?.toLowerCase().includes(q));
        return matchesCat && matchesQuery;
    });

    const subtotalUsd = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotalUsd * (discountPercent / 100);
    const subAfterDiscount = subtotalUsd - discountAmount;
    const availablePts = activeCustomer ? Number(activeCustomer.points) || 0 : 0;
    const maxPtsForOrder = Math.floor(subAfterDiscount / 0.25);
    const pointsToRedeem = usePoints ? Math.min(availablePts, maxPtsForOrder) : 0;
    const pointsDiscountUsd = pointsToRedeem * 0.25;

    return (
        <div className="pos-terminal-app d-flex flex-column vh-100 bg-light overflow-hidden">
            {/* 1. Header Bar */}
            <PosHeader 
                cashiers={cashiers}
                activeCashierId={activeCashierId}
                onSelectCashier={setActiveCashierId}
                exchangeRate={currentExchange}
                cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
                onOpenCustomerModal={() => setShowCustomerModal(true)}
            />

            {/* 2. Main Workspace: Products (Left) + Cart (Right) */}
            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* Left Section: Catalog, Search & Grid */}
                <div className="flex-grow-1 d-flex flex-column p-3 overflow-hidden">
                    {/* Search & Barcode Bar */}
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="input-group input-group-lg flex-grow-1 shadow-xs rounded-3 overflow-hidden">
                            <span className="input-group-text bg-white border-end-0 text-muted">
                                <i className="bi bi-upc-scan text-primary fs-5"></i>
                            </span>
                            <input 
                                ref={searchInputRef}
                                type="text"
                                className="form-control border-start-0 border-end-0 fw-semibold fs-15 ps-0"
                                placeholder="Scan barcode or type name / code / SKU (Press Enter to add)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                            {searchQuery && (
                                <button className="btn btn-white border-start-0 text-muted" type="button" onClick={() => setSearchQuery('')}>
                                    <i className="bi bi-x-circle-fill"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="category-scroll-container d-flex gap-2 pb-2 mb-2 overflow-x-auto">
                        <button 
                            type="button" 
                            className={`btn btn-sm rounded-pill px-3 fw-bold fs-12 text-nowrap shadow-xs ${activeCategory === 'all' ? 'btn-primary' : 'btn-white border text-secondary'}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            All Categories ({products.length})
                        </button>
                        {categories.map(cat => {
                            const count = products.filter(p => p.category_id === cat.id).length;
                            return (
                                <button 
                                    key={cat.id}
                                    type="button" 
                                    className={`btn btn-sm rounded-pill px-3 fw-bold fs-12 text-nowrap shadow-xs ${activeCategory === cat.id ? 'btn-primary' : 'btn-white border text-secondary'}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.name} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Product Grid */}
                    <div className="flex-grow-1 overflow-y-auto pe-1">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading products...</span>
                                </div>
                                <span className="d-block mt-2 text-muted fs-13">Loading catalog...</span>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                                <h5>No products found</h5>
                                <p className="fs-13">Try searching for something else or switch categories.</p>
                            </div>
                        ) : (
                            <div className="row g-2">
                                {filteredProducts.map(product => (
                                    <ProductCard 
                                        key={product.id}
                                        product={product}
                                        exchangeRate={rateVal}
                                        onSelectProduct={handleProductCardClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section: Shopping Cart Panel */}
                <CartPanel 
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onClearCart={handleClearCart}
                    discountPercent={discountPercent}
                    onChangeDiscount={setDiscountPercent}
                    customerType={customerType}
                    onChangeCustomerType={setCustomerType}
                    customerPhone={customerPhone}
                    onChangeCustomerPhone={setCustomerPhone}
                    activeCustomer={activeCustomer}
                    usePoints={usePoints}
                    onToggleUsePoints={setUsePoints}
                    exchangeRate={rateVal}
                    onProceedToCheckout={() => setShowCheckoutModal(true)}
                />
            </div>

            {/* 3. Modals */}
            <VariantModal 
                show={showVariantModal}
                product={selectedProductForVariant}
                exchangeRate={rateVal}
                onClose={() => setShowVariantModal(false)}
                onSelectVariant={addProductToCart}
            />

            <CheckoutModal 
                show={showCheckoutModal}
                onClose={() => setShowCheckoutModal(false)}
                cart={cart}
                subtotalUsd={subtotalUsd}
                discountPercent={discountPercent}
                activeCustomer={activeCustomer}
                customerType={customerType}
                customerName={activeCustomer ? activeCustomer.name : 'General Customer'}
                customerPhone={customerPhone}
                usePoints={usePoints}
                pointsToRedeem={pointsToRedeem}
                pointsDiscountUsd={pointsDiscountUsd}
                exchangeRate={currentExchange}
                paymentMethods={paymentMethods}
                activeCashierId={activeCashierId}
                onSubmitPayment={handlePaymentSubmit}
            />

            <ThermalReceiptModal 
                show={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                invoice={completedInvoice}
            />

            <QuickCustomerModal 
                show={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                onCustomerCreated={(newCust) => {
                    setCustomers(prev => [newCust, ...prev]);
                    setCustomerType('Special Customer');
                    setCustomerPhone(newCust.phone || '');
                    setActiveCustomer(newCust);
                }}
            />
        </div>
    );
};

export default HomePage;
