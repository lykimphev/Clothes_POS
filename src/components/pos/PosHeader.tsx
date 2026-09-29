import React, { useState, useEffect } from 'react';
import type { CashierUser, ExchangeRate } from '../../models/pos.types';

interface PosHeaderProps {
    cashiers: CashierUser[];
    activeCashierId: number;
    onSelectCashier: (id: number) => void;
    exchangeRate: ExchangeRate | null;
    cartCount: number;
    onOpenCustomerModal: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
    cashiers,
    activeCashierId,
    onSelectCashier,
    exchangeRate,
    cartCount,
    onOpenCustomerModal,
}) => {
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

    const rateVal = exchangeRate ? exchangeRate.rate : 4100;

    return (
        <header className="pos-header bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between shadow-xs">
            {/* Store & Terminal Info */}
            <div className="d-flex align-items-center gap-2">
                <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-xs" style={{ width: '38px', height: '38px' }}>
                    <i className="bi bi-shop fs-5"></i>
                </div>
                <div>
                    <h6 className="mb-0 fw-bold text-dark lh-sm">FASHION BOUTIQUE</h6>
                    <small className="text-muted fs-11 font-monospace">TERMINAL: <span className="badge bg-light text-dark border px-1">POS-01</span></small>
                </div>
            </div>

            {/* Exchange Rate & Shortcuts */}
            <div className="d-none d-md-flex align-items-center gap-2">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 fw-semibold">
                    <i className="bi bi-currency-exchange me-1"></i> $1 = {rateVal.toLocaleString()} ៛
                </span>
                <span className="badge bg-light text-secondary border px-2 py-1 fs-12 font-monospace">
                    <i className="bi bi-clock me-1 text-primary"></i> {currentTime}
                </span>
                <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary rounded-pill px-3 fs-12 fw-semibold d-flex align-items-center gap-1 shadow-xs"
                    onClick={onOpenCustomerModal}
                >
                    <i className="bi bi-person-plus-fill"></i> New Member
                </button>
            </div>

            {/* Cashier Selector & Cart Counter */}
            <div className="d-flex align-items-center gap-2">
                <div className="input-group input-group-sm" style={{ width: '190px' }}>
                    <span className="input-group-text bg-light text-muted border-end-0">
                        <i className="bi bi-person-badge text-primary"></i>
                    </span>
                    <select 
                        className="form-select form-select-sm fw-bold border-start-0"
                        value={activeCashierId}
                        onChange={(e) => onSelectCashier(Number(e.target.value))}
                    >
                        {cashiers.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.role?.name ? `(${c.role.name})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="position-relative">
                    <button type="button" className="btn btn-sm btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                        <i className="bi bi-cart3 fs-6 text-primary"></i>
                    </button>
                    {cartCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white fs-11">
                            {cartCount}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
};
