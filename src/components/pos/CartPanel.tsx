import React from 'react';
import type { CartItem, Customer } from '../../models/pos.types';

interface CartPanelProps {
    cart: CartItem[];
    onUpdateQuantity: (variantId: number, qty: number) => void;
    onRemoveItem: (variantId: number) => void;
    onClearCart: () => void;
    discountPercent: number;
    onChangeDiscount: (discount: number) => void;
    customerType: 'General Customer' | 'Special Customer';
    onChangeCustomerType: (type: 'General Customer' | 'Special Customer') => void;
    customerPhone: string;
    onChangeCustomerPhone: (phone: string) => void;
    activeCustomer: Customer | null;
    usePoints: boolean;
    onToggleUsePoints: (use: boolean) => void;
    exchangeRate: number;
    onProceedToCheckout: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    discountPercent,
    onChangeDiscount,
    customerType,
    onChangeCustomerType,
    customerPhone,
    onChangeCustomerPhone,
    activeCustomer,
    usePoints,
    onToggleUsePoints,
    exchangeRate,
    onProceedToCheckout,
}) => {
    const subtotalUsd = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotalUsd * (discountPercent / 100);
    const subAfterDiscount = subtotalUsd - discountAmount;

    const availablePts = activeCustomer ? Number(activeCustomer.points) || 0 : 0;
    const maxPtsForOrder = Math.floor(subAfterDiscount / 0.25);
    const pointsToRedeem = usePoints ? Math.min(availablePts, maxPtsForOrder) : 0;
    const pointsDiscountUsd = pointsToRedeem * 0.25;

    const finalTotalUsd = Math.max(0, subtotalUsd - discountAmount - pointsDiscountUsd);
    const finalTotalKhr = Math.round(finalTotalUsd * exchangeRate);

    return (
        <div className="pos-cart-panel bg-white border-start d-flex flex-column h-100 shadow-sm" style={{ width: '380px', minWidth: '340px' }}>
            {/* Cart Header */}
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-bag-check-fill text-primary fs-5"></i>
                    <h6 className="mb-0 fw-bold text-dark">Current Order</h6>
                    <span className="badge bg-primary rounded-pill px-2 fs-11">{cart.length}</span>
                </div>
                {cart.length > 0 && (
                    <button 
                        type="button" 
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0 fs-12 fw-semibold"
                        onClick={onClearCart}
                    >
                        <i className="bi bi-trash3 me-1"></i> Clear (F9)
                    </button>
                )}
            </div>

            {/* Customer & Loyalty Selector */}
            <div className="p-2 border-bottom bg-body">
                <div className="d-flex gap-1 mb-2">
                    <button 
                        type="button" 
                        className={`btn btn-sm flex-fill fw-bold rounded-2 fs-12 ${customerType === 'General Customer' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => onChangeCustomerType('General Customer')}
                    >
                        General Customer
                    </button>
                    <button 
                        type="button" 
                        className={`btn btn-sm flex-fill fw-bold rounded-2 fs-12 ${customerType === 'Special Customer' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => onChangeCustomerType('Special Customer')}
                    >
                        ⭐ Special Member
                    </button>
                </div>

                {customerType === 'Special Customer' && (
                    <div className="p-2 rounded-2 bg-light border">
                        <div className="input-group input-group-sm mb-1">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-telephone text-primary"></i>
                            </span>
                            <input 
                                type="text"
                                className="form-control form-control-sm border-start-0 fw-bold"
                                placeholder="Enter phone number..."
                                value={customerPhone}
                                onChange={(e) => onChangeCustomerPhone(e.target.value)}
                            />
                        </div>

                        {activeCustomer && (
                            <div className="d-flex align-items-center justify-content-between pt-1">
                                <div>
                                    <span className="fw-bold text-dark fs-12 d-block">{activeCustomer.name}</span>
                                    <small className="text-muted fs-11">
                                        Points: <strong className="text-primary">{availablePts}</strong> (${(availablePts * 0.25).toFixed(2)})
                                    </small>
                                </div>
                                {availablePts > 0 && (
                                    <div className="form-check form-switch m-0">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="usePtsToggle"
                                            checked={usePoints}
                                            onChange={(e) => onToggleUsePoints(e.target.checked)}
                                        />
                                        <label className="form-check-label fs-11 fw-bold text-dark" htmlFor="usePtsToggle">Use</label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scrollable Cart Items List */}
            <div className="flex-grow-1 overflow-y-auto p-2">
                {cart.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-cart-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                        <span className="fs-13 fw-semibold">No items in cart</span>
                        <small className="d-block text-muted mt-1">Tap items on the left or scan barcode to add</small>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-2">
                        {cart.map(item => {
                            const itemTotal = item.price * item.quantity;

                            return (
                                <div key={item.variant_id} className="p-2 border rounded-3 bg-white shadow-xs d-flex align-items-center justify-content-between gap-2">
                                    <div className="d-flex align-items-center gap-2 flex-grow-1 text-truncate">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} className="rounded-2 bg-light p-1 border" />
                                        ) : (
                                            <div className="bg-light rounded-2 p-2 text-muted"><i className="bi bi-tag"></i></div>
                                        )}
                                        <div className="text-truncate">
                                            <span className="fw-bold text-dark fs-13 d-block text-truncate">{item.name}</span>
                                            <small className="text-muted fs-11 font-monospace">{item.variant_name} • ${item.price.toFixed(2)}</small>
                                        </div>
                                    </div>

                                    {/* Quantity Stepper */}
                                    <div className="d-flex align-items-center gap-1">
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center"
                                            style={{ width: '24px', height: '24px' }}
                                            onClick={() => onUpdateQuantity(item.variant_id, item.quantity - 1)}
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <span className="fw-bold fs-13 text-center" style={{ minWidth: '24px' }}>
                                            {item.quantity}
                                        </span>
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center"
                                            style={{ width: '24px', height: '24px' }}
                                            onClick={() => onUpdateQuantity(item.variant_id, item.quantity + 1)}
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>

                                    <div className="text-end" style={{ minWidth: '60px' }}>
                                        <span className="fw-bold text-dark fs-13 d-block">${itemTotal.toFixed(2)}</span>
                                        <button 
                                            type="button" 
                                            className="btn btn-sm text-danger p-0 fs-11"
                                            onClick={() => onRemoveItem(item.variant_id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cart Summary & Action */}
            <div className="p-3 border-top bg-light mt-auto">
                {/* Quick Discount Pills */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <small className="text-muted fw-bold fs-11">Discount:</small>
                    <div className="d-flex gap-1">
                        {[0, 5, 10, 15, 20].map(d => (
                            <button
                                key={d}
                                type="button"
                                className={`btn btn-xs rounded-pill px-2 py-0 fs-11 fw-bold ${discountPercent === d ? 'btn-danger' : 'btn-outline-secondary'}`}
                                onClick={() => onChangeDiscount(d)}
                            >
                                {d === 0 ? 'None' : `${d}%`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="d-flex justify-content-between fs-12 text-muted mb-1">
                    <span>Subtotal</span>
                    <span className="fw-bold text-dark">${subtotalUsd.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="d-flex justify-content-between fs-12 text-danger mb-1">
                        <span>Discount ({discountPercent}%)</span>
                        <span className="fw-bold">-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                {pointsDiscountUsd > 0 && (
                    <div className="d-flex justify-content-between fs-12 text-success mb-1">
                        <span>Points Discount ({pointsToRedeem} pts)</span>
                        <span className="fw-bold">-${pointsDiscountUsd.toFixed(2)}</span>
                    </div>
                )}

                <hr className="my-2" />

                <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <div>
                        <span className="fw-black text-dark fs-16 d-block lh-1">TOTAL</span>
                        <small className="text-muted fs-12 font-monospace">{finalTotalKhr.toLocaleString()} ៛</small>
                    </div>
                    <span className="fw-black text-success fs-3 lh-1">${finalTotalUsd.toFixed(2)}</span>
                </div>

                <button 
                    type="button" 
                    className="btn btn-success w-100 py-2 rounded-3 fw-bold fs-15 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    disabled={cart.length === 0}
                    onClick={onProceedToCheckout}
                >
                    <i className="bi bi-credit-card-fill fs-5"></i>
                    <span>PAY / CHECKOUT (F4)</span>
                </button>
            </div>
        </div>
    );
};
