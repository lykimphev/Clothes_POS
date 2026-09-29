import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { generateAbaDynamicKhqr } from '../../utils/khqrGenerator';
import type { CartItem, Customer, PaymentMethod, ExchangeRate } from '../../models/pos.types';

interface CheckoutModalProps {
    show: boolean;
    onClose: () => void;
    cart: CartItem[];
    subtotalUsd: number;
    discountPercent: number;
    activeCustomer: Customer | null;
    customerType: 'General Customer' | 'Special Customer';
    customerName: string;
    customerPhone: string;
    usePoints: boolean;
    pointsToRedeem: number;
    pointsDiscountUsd: number;
    exchangeRate: ExchangeRate | null;
    paymentMethods: PaymentMethod[];
    activeCashierId: number;
    onSubmitPayment: (payload: any, shouldPrint: boolean) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    show,
    onClose,
    cart,
    subtotalUsd,
    discountPercent,
    activeCustomer,
    customerType,
    customerName,
    customerPhone,
    usePoints,
    pointsToRedeem,
    pointsDiscountUsd,
    exchangeRate,
    paymentMethods,
    activeCashierId,
    onSubmitPayment,
}) => {
    const [paymentTab, setPaymentTab] = useState<'cash' | 'khqr' | 'card'>('cash');
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number>(1);
    const [receivedUsd, setReceivedUsd] = useState<string>('');
    const [receivedKhr, setReceivedKhr] = useState<string>('');
    const [autoPrint, setAutoPrint] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [countdownSeconds, setCountdownSeconds] = useState<number>(300);
    const [khqrString, setKhqrString] = useState<string>('');
    const timerRef = useRef<any>(null);

    const rateVal = exchangeRate ? exchangeRate.rate : 4100;
    const discountAmount = subtotalUsd * (discountPercent / 100);
    const finalTotalUsd = Math.max(0, subtotalUsd - discountAmount - pointsDiscountUsd);
    const finalTotalKhr = Math.round(finalTotalUsd * rateVal);

    const recUsdNum = parseFloat(receivedUsd) || 0;
    const recKhrNum = parseFloat(receivedKhr) || 0;
    const totalReceivedInUsd = recUsdNum + (recKhrNum / rateVal);

    let changeUsd = 0;
    let changeKhr = 0;
    if (totalReceivedInUsd > finalTotalUsd) {
        changeUsd = totalReceivedInUsd - finalTotalUsd;
        changeKhr = changeUsd * rateVal;
    }

    useEffect(() => {
        if (show) {
            setPaymentTab('cash');
            setReceivedUsd('');
            setReceivedKhr('');
            setIsSubmitting(false);

            const cashPm = paymentMethods.find(pm => pm.MethodName.toLowerCase().includes('cash')) || paymentMethods[0];
            if (cashPm) setSelectedPaymentMethodId(cashPm.id);

            refreshKhqr();
        } else {
            clearInterval(timerRef.current);
        }
    }, [show, finalTotalUsd]);

    useEffect(() => {
        if (show && paymentTab === 'khqr') {
            startTimer();
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [show, paymentTab]);

    const startTimer = () => {
        clearInterval(timerRef.current);
        setCountdownSeconds(300);
        timerRef.current = setInterval(() => {
            setCountdownSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const refreshKhqr = () => {
        const qr = generateAbaDynamicKhqr(finalTotalUsd);
        setKhqrString(qr);
        startTimer();
    };

    const handleSelectTab = (tab: 'cash' | 'khqr' | 'card') => {
        setPaymentTab(tab);
        if (tab === 'cash') {
            const cashPm = paymentMethods.find(pm => pm.MethodName.toLowerCase().includes('cash')) || paymentMethods[0];
            if (cashPm) setSelectedPaymentMethodId(cashPm.id);
        } else if (tab === 'khqr') {
            const bankPm = paymentMethods.find(pm => {
                const name = pm.MethodName.toLowerCase();
                return name.includes('aba') || name.includes('bakong') || name.includes('khqr');
            }) || paymentMethods[0];
            if (bankPm) setSelectedPaymentMethodId(bankPm.id);
            refreshKhqr();
        }
    };

    const handleExecutePayment = async () => {
        setIsSubmitting(true);
        const payload = {
            cart_items: cart.map(i => ({
                id: i.id,
                variant_id: i.variant_id,
                quantity: i.quantity,
                price: i.price,
            })),
            user_id: activeCashierId,
            customer_type: customerType,
            customer_name: customerName,
            customer_phone: customerPhone,
            exchange_id: exchangeRate ? exchangeRate.id : null,
            discount: discountPercent,
            payment_method_id: selectedPaymentMethodId,
            total_usd: finalTotalUsd,
            redeem_points: pointsToRedeem,
            points_discount_usd: pointsDiscountUsd,
        };

        try {
            await onSubmitPayment(payload, autoPrint);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCountdown = () => {
        const mins = String(Math.floor(countdownSeconds / 60)).padStart(2, '0');
        const secs = String(countdownSeconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
            <Modal.Header closeButton className="border-bottom py-3 bg-light">
                <Modal.Title className="fs-16 fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="bi bi-credit-card-2-front text-primary fs-5"></i>
                    <span>Payment & Checkout (ទូទាត់ប្រាក់)</span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
                <div className="d-flex gap-2 mb-3">
                    <button 
                        type="button" 
                        className={`btn flex-fill py-2 fw-bold rounded-3 fs-13 d-flex align-items-center justify-content-center gap-2 ${paymentTab === 'cash' ? 'btn-success text-white shadow-xs' : 'btn-outline-secondary'}`}
                        onClick={() => handleSelectTab('cash')}
                    >
                        <i className="bi bi-cash-stack fs-5"></i>
                        <span>Cash (សាច់ប្រាក់)</span>
                    </button>

                    <button 
                        type="button" 
                        className={`btn flex-fill py-2 fw-bold rounded-3 fs-13 d-flex align-items-center justify-content-center gap-2 ${paymentTab === 'khqr' ? 'btn-danger text-white shadow-xs' : 'btn-outline-secondary'}`}
                        onClick={() => handleSelectTab('khqr')}
                    >
                        <i className="bi bi-qr-code-scan fs-5"></i>
                        <span>Bakong KHQR</span>
                    </button>

                    <button 
                        type="button" 
                        className={`btn flex-fill py-2 fw-bold rounded-3 fs-13 d-flex align-items-center justify-content-center gap-2 ${paymentTab === 'card' ? 'btn-primary text-white shadow-xs' : 'btn-outline-secondary'}`}
                        onClick={() => handleSelectTab('card')}
                    >
                        <i className="bi bi-credit-card fs-5"></i>
                        <span>Card / Bank</span>
                    </button>
                </div>

                {paymentTab === 'cash' && (
                    <div className="mb-3">
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label text-muted small fw-bold mb-1">
                                    <i className="bi bi-currency-dollar text-success me-1"></i> Received ($ USD)
                                </label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="form-control form-control-lg fw-bold fs-16 rounded-3"
                                    placeholder="0.00"
                                    value={receivedUsd}
                                    onChange={(e) => setReceivedUsd(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label text-muted small fw-bold mb-1">
                                    <i className="bi bi-cash text-primary me-1"></i> Received (៛ KHR)
                                </label>
                                <input 
                                    type="number"
                                    step="100"
                                    className="form-control form-control-lg fw-bold fs-16 rounded-3"
                                    placeholder="0"
                                    value={receivedKhr}
                                    onChange={(e) => setReceivedKhr(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-bold fs-14 text-dark d-block">Change to Customer (លុយអាប់)</span>
                                <small className="text-muted fs-11">Dual-currency calculation</small>
                            </div>
                            <div className="text-end">
                                <span className="fw-black fs-4 text-primary font-monospace">
                                    ${changeUsd.toFixed(2)} / {Math.round(changeKhr).toLocaleString()} ៛
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {paymentTab === 'khqr' && (
                    <div className="card border border-danger-subtle p-3 rounded-3 text-center mb-3 bg-body shadow-xs">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <Badge bg="danger" className="rounded-pill px-3 py-2 fs-12">
                                <i className="bi bi-qr-code me-1"></i> Dynamic KHQR (Auto-sets Price)
                            </Badge>
                            <div className="d-flex align-items-center gap-1">
                                <Badge bg="primary-subtle" className="text-primary fw-bold fs-12 px-2 py-1 rounded-pill">
                                    ABA Bank • KIMPHEV LY
                                </Badge>
                                <Badge 
                                    bg={countdownSeconds <= 60 ? 'danger' : 'danger-subtle'} 
                                    className={`${countdownSeconds <= 60 ? 'text-white' : 'text-danger'} fw-bold fs-12 px-2 py-1 rounded-pill font-monospace`}
                                >
                                    ⏱️ {formatCountdown()}
                                </Badge>
                            </div>
                        </div>

                        <div className="py-1">
                            <small className="text-muted fs-11 d-block fw-semibold text-uppercase">Auto-Filled Amount:</small>
                            <div className="fw-black text-danger fs-2">${finalTotalUsd.toFixed(2)}</div>
                            <div className="fw-bold text-secondary fs-14">{finalTotalKhr.toLocaleString()} ៛</div>
                        </div>

                        <div className="position-relative d-inline-block mx-auto my-2 p-2 bg-white rounded-3 border shadow-xs" style={{ width: '195px', height: '195px' }}>
                            {countdownSeconds > 0 ? (
                                <>
                                    <QRCodeSVG 
                                        value={khqrString} 
                                        size={175}
                                        level="M"
                                    />
                                    <div className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', pointerEvents: 'none' }}>
                                        <span className="badge rounded-circle bg-danger text-white p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '10px', fontWeight: 900 }}>
                                            KH
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <i className="bi bi-clock-history text-danger fs-2 mb-1"></i>
                                    <span className="text-danger fw-bold fs-12">QR Expired</span>
                                    <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 mt-2 fs-11" onClick={refreshKhqr}>
                                        <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="d-inline-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded-pill bg-danger-subtle text-danger fw-semibold fs-12 border border-danger-subtle mx-auto my-1">
                            <i className="bi bi-bank fs-14"></i>
                            <span>Scan with ABA, ACLEDA, Bakong, Wing & Any App</span>
                        </div>
                        <small className="text-success fs-11 mt-1 d-block fw-semibold">
                            ✓ Amount is automatically filled in customer's banking app!
                        </small>
                    </div>
                )}

                {paymentTab === 'card' && (
                    <div className="bg-light p-3 rounded-3 border mb-3">
                        <label className="form-label text-muted small fw-bold mb-2">Select Digital Bank Terminal</label>
                        <div className="row g-2">
                            {paymentMethods.filter(pm => !pm.MethodName.toLowerCase().includes('cash')).map(pm => (
                                <div key={pm.id} className="col-6 col-sm-4">
                                    <div 
                                        className={`card border h-100 p-2 text-center cursor-pointer ${selectedPaymentMethodId === pm.id ? 'border-primary bg-primary-subtle shadow-xs' : 'bg-white'}`}
                                        onClick={() => setSelectedPaymentMethodId(pm.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="bi bi-credit-card-2-back fs-4 mb-1 text-primary"></i>
                                        <span className="fs-12 fw-bold text-dark text-capitalize text-truncate d-block">{pm.MethodName}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-light p-3 rounded-3 border">
                    {activeCustomer && (
                        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom fs-13">
                            <span className="text-muted"><i className="bi bi-person-check text-primary me-1"></i> Customer:</span>
                            <span className="fw-bold text-dark">{customerName} {customerPhone ? `(${customerPhone})` : ''}</span>
                        </div>
                    )}
                    <div className="d-flex justify-content-between mb-1 fs-14 text-muted">
                        <span>Subtotal (USD)</span>
                        <span className="fw-bold text-dark">${subtotalUsd.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="d-flex justify-content-between mb-1 fs-14 text-danger">
                            <span>Discount ({discountPercent}%)</span>
                            <span className="fw-bold">-${discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {usePoints && pointsDiscountUsd > 0 && (
                        <div className="d-flex justify-content-between mb-1 fs-14 text-success">
                            <span>Points Discount ({pointsToRedeem} pts)</span>
                            <span className="fw-bold">-${pointsDiscountUsd.toFixed(2)}</span>
                        </div>
                    )}
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark fs-15">Total (USD)</span>
                        <span className="fw-black text-success fs-3">${finalTotalUsd.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark fs-14">Total (KHR)</span>
                        <span className="fw-bold text-secondary fs-4">{finalTotalKhr.toLocaleString()} ៛</span>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="bg-light border-top p-3 d-flex justify-content-between align-items-center">
                <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                    <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="autoPrintCheck"
                        checked={autoPrint}
                        onChange={(e) => setAutoPrint(e.target.checked)}
                    />
                    <label className="form-check-label fs-13 fw-semibold text-dark user-select-none" htmlFor="autoPrintCheck">
                        <i className="bi bi-printer text-primary me-1"></i> Print Receipt
                    </label>
                </div>

                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" className="px-3 py-2 fw-bold fs-13 rounded-3" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button 
                        variant={paymentTab === 'khqr' ? 'danger' : paymentTab === 'card' ? 'primary' : 'success'}
                        className="px-4 py-2 fw-bold fs-15 rounded-3 shadow-sm d-flex align-items-center gap-2"
                        onClick={handleExecutePayment}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span>Processing...</span>
                        ) : paymentTab === 'khqr' ? (
                            <>
                                <i className="bi bi-qr-code-scan"></i>
                                <span>Confirm QR Payment (${finalTotalUsd.toFixed(2)})</span>
                            </>
                        ) : paymentTab === 'card' ? (
                            <>
                                <i className="bi bi-credit-card-fill"></i>
                                <span>Complete Card (${finalTotalUsd.toFixed(2)})</span>
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check2-circle"></i>
                                <span>Pay Cash (${finalTotalUsd.toFixed(2)})</span>
                            </>
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};
