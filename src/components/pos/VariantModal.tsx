import React from 'react';
import { Modal, Badge } from 'react-bootstrap';
import type { Product, ProductVariant } from '../../models/pos.types';

interface VariantModalProps {
    show: boolean;
    product: Product | null;
    exchangeRate: number;
    onClose: () => void;
    onSelectVariant: (product: Product, variant: ProductVariant) => void;
}

export const VariantModal: React.FC<VariantModalProps> = ({
    show,
    product,
    exchangeRate,
    onClose,
    onSelectVariant,
}) => {
    if (!product) return null;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fs-16 fw-bold">
                    <i className="bi bi-layers me-2 text-primary"></i> Select Size / Color Variant
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3 mb-3 border">
                    {product.image_url && (
                        <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} className="rounded-2" />
                    )}
                    <div>
                        <h6 className="mb-0 fw-bold">{product.name}</h6>
                        <small className="text-muted font-monospace">{product.product_code}</small>
                    </div>
                </div>

                <label className="form-label text-muted small fw-bold mb-2">Available Options:</label>
                <div className="list-group">
                    {product.variants.map(v => {
                        let variantName = v.sku || 'Standard';
                        if (v.attributes && typeof v.attributes === 'object' && !Array.isArray(v.attributes)) {
                            variantName = Object.values(v.attributes).join(' / ');
                        } else if (v.attribute_values && Array.isArray(v.attribute_values) && v.attribute_values.length > 0) {
                            variantName = v.attribute_values.map(av => av.value).join(' / ');
                        }
                        const isOut = (v.current_stock || 0) <= 0;
                        const vPriceUsd = Number(v.selling_price ?? v.price ?? 0);
                        const vPriceKhr = Math.round(vPriceUsd * exchangeRate);

                        return (
                            <button
                                key={v.id}
                                type="button"
                                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 border ${isOut ? 'disabled bg-light' : ''}`}
                                onClick={() => !isOut && onSelectVariant(product, v)}
                                disabled={isOut}
                            >
                                <div>
                                    <div className="fw-bold fs-14 text-dark">{variantName}</div>
                                    <small className="text-muted font-monospace">SKU: {v.sku} | Barcode: {v.barcode || 'N/A'}</small>
                                </div>
                                <div className="text-end">
                                    <span className="fw-bold text-primary fs-15 d-block">${vPriceUsd.toFixed(2)}</span>
                                    <small className="text-muted fs-11">{vPriceKhr.toLocaleString()} ៛</small>
                                    <div className="mt-1">
                                        {isOut ? (
                                            <Badge bg="danger" className="fs-10">Out of Stock</Badge>
                                        ) : (
                                            <Badge bg="success-subtle" className="text-success border border-success-subtle fs-10">
                                                Stock: {v.current_stock}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Modal.Body>
        </Modal>
    );
};
