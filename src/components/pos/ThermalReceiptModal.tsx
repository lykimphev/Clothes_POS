import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import type { Invoice } from '../../models/pos.types';

interface ThermalReceiptModalProps {
    show: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
    show,
    onClose,
    invoice,
}) => {
    if (!invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    const rate = invoice.exchange?.rate || 4100;
    const totalUsd = Number(invoice.total);
    const totalKhr = Math.round(totalUsd * rate);

    return (
        <Modal show={show} onHide={onClose} centered size="sm">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fs-15 fw-bold">
                    <i className="bi bi-receipt me-1 text-primary"></i> Thermal Receipt
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
                <div id="thermalReceiptPaper" className="p-3 bg-white text-dark font-monospace border rounded-2 shadow-xs" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    <div className="text-center mb-2 pb-2 border-bottom border-dark border-dashed">
                        <h6 className="fw-bolder mb-0 text-uppercase">FASHION BOUTIQUE</h6>
                        <small className="d-block text-muted">#123 Street 271, Phnom Penh</small>
                        <small className="d-block text-muted">Tel: 012 345 678 / 098 765 432</small>
                    </div>

                    <div className="mb-2 pb-2 border-bottom border-dark border-dashed">
                        <div className="d-flex justify-content-between">
                            <span>Invoice #:</span>
                            <span className="fw-bold">INV-{String(invoice.id).padStart(6, '0')}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Date:</span>
                            <span>{new Date(invoice.invoiceDate || Date.now()).toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Cashier:</span>
                            <span>{invoice.user?.name || 'Cashier 01'}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Customer:</span>
                            <span>{invoice.customer?.name || 'General Customer'}</span>
                        </div>
                    </div>

                    <table className="w-100 mb-2 border-bottom border-dark border-dashed">
                        <thead>
                            <tr className="border-bottom border-dark">
                                <th className="text-start py-1">Item</th>
                                <th className="text-center py-1">Qty</th>
                                <th className="text-end py-1">Price</th>
                                <th className="text-end py-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.details?.map(d => (
                                <tr key={d.id}>
                                    <td className="text-start py-1 text-truncate" style={{ maxWidth: '110px' }}>
                                        {d.product?.name || 'Clothing Item'}
                                    </td>
                                    <td className="text-center py-1">{d.qty}</td>
                                    <td className="text-end py-1">${Number(d.price).toFixed(2)}</td>
                                    <td className="text-end py-1 fw-bold">${Number(d.totalPay).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mb-2 pb-2 border-bottom border-dark border-dashed">
                        {Number(invoice.discount) > 0 && (
                            <div className="d-flex justify-content-between text-danger">
                                <span>Discount ({invoice.discount}%):</span>
                                <span>-${(Number(invoice.total) * (invoice.discount / 100)).toFixed(2)}</span>
                            </div>
                        )}
                        {Number(invoice.points_discount_amount) > 0 && (
                            <div className="d-flex justify-content-between text-success">
                                <span>Points Used:</span>
                                <span>-${Number(invoice.points_discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between fs-14 fw-bolder mt-1">
                            <span>TOTAL (USD):</span>
                            <span>${totalUsd.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold">
                            <span>TOTAL (KHR):</span>
                            <span>{totalKhr.toLocaleString()} ៛</span>
                        </div>
                    </div>

                    <div className="text-center mt-3 pt-2">
                        <small className="fw-bold d-block">THANK YOU FOR YOUR PURCHASE!</small>
                        <small className="text-muted d-block fs-10">Goods sold are non-refundable within 3 days.</small>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 d-flex justify-content-between">
                <Button variant="outline-secondary" size="sm" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" size="sm" onClick={handlePrint} className="d-flex align-items-center gap-1">
                    <i className="bi bi-printer"></i> Print Receipt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
