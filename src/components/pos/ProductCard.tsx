import React from 'react';
import type { Product } from '../../models/pos.types';

interface ProductCardProps {
    product: Product;
    exchangeRate: number;
    onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    exchangeRate,
    onSelectProduct,
}) => {
    const firstVariant = product.variants?.[0];
    const priceUsd = firstVariant ? Number(firstVariant.selling_price ?? firstVariant.price ?? 0) : 0;
    const priceKhr = Math.round(priceUsd * exchangeRate);
    
    const totalStock = product.variants?.reduce((sum, v) => sum + (Number(v.current_stock) || 0), 0) ?? 0;
    const isOutOfStock = totalStock <= 0;
    const hasMultipleVariants = (product.variants?.length ?? 0) > 1;

    return (
        <div className={`col-6 col-sm-4 col-md-4 col-lg-3 col-xl-2 mb-3 ${isOutOfStock ? 'opacity-60' : ''}`}>
            <div 
                className="card h-100 product-card border shadow-xs rounded-3 overflow-hidden cursor-pointer position-relative d-flex flex-column justify-content-between transition-all"
                onClick={() => !isOutOfStock && onSelectProduct(product)}
                style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', minHeight: '230px' }}
            >
                <div className="position-absolute top-0 start-0 m-1 z-1">
                    {isOutOfStock ? (
                        <span className="badge bg-danger shadow-xs fs-10">Out of Stock</span>
                    ) : hasMultipleVariants ? (
                        <span className="badge bg-info text-dark shadow-xs fs-10">
                            {product.variants.length} Variants
                        </span>
                    ) : (
                        <span className="badge bg-light text-muted border shadow-xs fs-10">
                            Stock: {totalStock}
                        </span>
                    )}
                </div>

                <div className="product-img-wrapper bg-light d-flex align-items-center justify-content-center p-2 position-relative" style={{ height: '120px' }}>
                    {product.image_url ? (
                        <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="img-fluid rounded-2"
                            style={{ maxHeight: '105px', maxWidth: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <i className="bi bi-tag fs-1 text-muted opacity-50"></i>
                    )}
                </div>

                <div className="p-2 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                        <small className="text-muted fs-11 font-monospace d-block text-truncate">
                            {product.product_code || `PRD-${product.id}`}
                        </small>
                        <span className="fw-bold text-dark fs-13 d-block text-truncate lh-sm" title={product.name}>
                            {product.name}
                        </span>
                    </div>

                    <div className="mt-2 pt-1 border-top d-flex align-items-baseline justify-content-between">
                        <div>
                            <span className="fw-black text-primary fs-15 d-block lh-1">
                                ${priceUsd.toFixed(2)}
                            </span>
                            <small className="text-muted fs-11">
                                {priceKhr.toLocaleString()} ៛
                            </small>
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center shadow-xs"
                            style={{ width: '28px', height: '28px' }}
                            disabled={isOutOfStock}
                        >
                            <i className="bi bi-plus-lg fs-14"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
