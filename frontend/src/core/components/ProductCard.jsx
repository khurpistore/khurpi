/**
 * ProductCard Component - Reusable product card
 * Used across customer, vendor, delivery, and admin parts
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { StockBadge, GrowingBadge } from './StockBadge';
import { PriceDisplay, PricePerUnit } from './PriceDisplay';
import { QuantitySelector } from './QuantitySelector';
import { useProduct } from '../hooks';
import { getStockStatus } from '../utils';

/**
 * ProductCard - Grid view product card
 */
export const ProductCard = ({
  product,
  onAddToCart,
  onViewDetails,
  isWholesale = false,
  showQuantitySelector = true,
  showAddToCart = true,
  className = ''
}) => {
  const {
    selectedQty,
    updateQuantity,
    pricePerUnit,
    totalPrice,
    stockInfo,
    isOutOfStock,
    getCartProduct
  } = useProduct(product, { isWholesale });
  
  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(getCartProduct());
    }
  };
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };
  
  return (
    <Card 
      className={`overflow-hidden group transition-all hover:shadow-lg ${isOutOfStock ? 'opacity-75' : ''} ${className}`}
      data-testid={`product-card-${product.id}`}
    >
      {/* Image Section */}
      <div 
        className="relative aspect-square cursor-pointer"
        onClick={handleViewDetails}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${isOutOfStock ? 'grayscale' : ''}`}
        />
        
        {/* Stock Badge */}
        <div className="absolute top-2 left-2">
          <StockBadge product={product} size="sm" />
        </div>
        
        {/* Wholesale Badge */}
        {isWholesale && product.wholesale_price > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">WP</span>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* Product Name */}
        <h3 
          className="font-semibold text-sm mb-1 line-clamp-1 cursor-pointer hover:text-primary"
          onClick={handleViewDetails}
        >
          {product.name}
        </h3>
        
        {/* Price */}
        <PricePerUnit 
          price={pricePerUnit} 
          unit={product.unit} 
          className="text-xs mb-2" 
        />
        
        {/* Quantity & Add to Cart */}
        {showQuantitySelector && showAddToCart && !isOutOfStock && (
          <div className="flex items-center gap-2">
            <QuantitySelector
              product={product}
              value={selectedQty}
              onChange={updateQuantity}
              size="sm"
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="h-7 px-2"
              data-testid={`add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        {/* Out of Stock Message */}
        {isOutOfStock && (
          <Button variant="outline" size="sm" className="w-full" disabled>
            Out of Stock
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * ProductListItem - List view product item
 */
export const ProductListItem = ({
  product,
  onAddToCart,
  onViewDetails,
  isWholesale = false,
  className = ''
}) => {
  const {
    selectedQty,
    updateQuantity,
    pricePerUnit,
    totalPrice,
    stockInfo,
    isOutOfStock,
    getCartProduct
  } = useProduct(product, { isWholesale });
  
  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(getCartProduct());
    }
  };
  
  return (
    <Card className={`overflow-hidden ${isOutOfStock ? 'opacity-75' : ''} ${className}`}>
      <CardContent className="p-3 flex gap-4">
        {/* Image */}
        <div 
          className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
          onClick={() => onViewDetails?.(product)}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover rounded-lg ${isOutOfStock ? 'grayscale' : ''}`}
          />
        </div>
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 
                className="font-semibold cursor-pointer hover:text-primary"
                onClick={() => onViewDetails?.(product)}
              >
                {product.name}
              </h3>
              <PricePerUnit price={pricePerUnit} unit={product.unit} className="text-sm" />
            </div>
            <StockBadge product={product} size="sm" />
          </div>
          
          {/* Actions */}
          {!isOutOfStock && (
            <div className="flex items-center gap-2 mt-2">
              <QuantitySelector
                product={product}
                value={selectedQty}
                onChange={updateQuantity}
                size="sm"
              />
              <span className="text-sm font-medium text-primary">₹{totalPrice.toFixed(0)}</span>
              <Button size="sm" onClick={handleAddToCart} className="ml-auto">
                <ShoppingCart className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
