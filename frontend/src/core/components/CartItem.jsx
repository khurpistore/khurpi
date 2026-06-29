/**
 * CartItem Component - Reusable cart item display
 * Used across customer, vendor, delivery, and admin parts
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Sprout, BadgePercent } from 'lucide-react';
import { QuantitySelector } from './QuantitySelector';
import { formatQuantity, formatPricePerUnit, getStockStatus } from '../utils';

/**
 * CartItem - Compact cart item for sidebar/drawer
 */
export const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  isWholesale = false,
  showRemove = true,
  className = ''
}) => {
  const product = item.product || item;
  const quantity = product.selectedQty || item.quantity || 1;
  const unit = product.unit || 'kg';
  const price = isWholesale && product.wholesale_price > 0 
    ? product.wholesale_price 
    : product.price || 0;
  const totalPrice = price * quantity;
  const stockInfo = getStockStatus(product);
  const isGrowing = stockInfo.status === 'growing';
  const showWholesaleBadge = isWholesale && product.wholesale_price > 0;
  
  return (
    <div 
      className={`flex items-center gap-2 p-2 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'} ${className}`}
      data-testid={`cart-item-${product.id}`}
    >
      {/* Image */}
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-12 h-12 rounded object-cover" 
        />
        {isGrowing && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
            <Sprout className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium truncate">{product.name}</p>
          {showWholesaleBadge && (
            <BadgePercent className="w-3 h-3 text-orange-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatPricePerUnit(price, unit)}
        </p>
      </div>
      
      {/* Quantity Selector */}
      {onUpdateQuantity && (
        <QuantitySelector
          product={product}
          value={quantity}
          onChange={(qty) => onUpdateQuantity(product.id, qty)}
          size="sm"
        />
      )}
      
      {/* Price */}
      <span className="text-sm font-medium min-w-[50px] text-right">
        ₹{totalPrice.toFixed(0)}
      </span>
      
      {/* Remove Button */}
      {showRemove && onRemove && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemove(product.id)} 
          className="text-red-500 hover:text-red-600 h-6 px-1"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

/**
 * CartItemReadOnly - Read-only cart item for checkout/order review
 */
export const CartItemReadOnly = ({
  item,
  isWholesale = false,
  className = ''
}) => {
  const product = item.product || item;
  const quantity = product.selectedQty || item.quantity || 1;
  const unit = product.unit || 'kg';
  const price = isWholesale && product.wholesale_price > 0 
    ? product.wholesale_price 
    : (item.price_at_order || item.price || product.price || 0);
  const totalPrice = price * quantity;
  const stockInfo = getStockStatus(product);
  const isGrowing = stockInfo.status === 'growing';
  const showWholesaleBadge = isWholesale && product.wholesale_price > 0;
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'} ${className}`}>
      {/* Image */}
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-12 h-12 rounded object-cover" 
        />
        {isGrowing && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
            <Sprout className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium truncate">{product.name}</p>
          {showWholesaleBadge && (
            <BadgePercent className="w-3 h-3 text-orange-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatPricePerUnit(price, unit)}
        </p>
      </div>
      
      {/* Quantity Badge */}
      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium">
        {formatQuantity(quantity, unit)}
      </span>
      
      {/* Price */}
      <span className="text-sm font-medium">₹{totalPrice.toFixed(0)}</span>
    </div>
  );
};

/**
 * OrderItem - Order history item display
 */
export const OrderItem = ({
  item,
  className = ''
}) => {
  const product = item.product || {};
  const quantity = item.quantity || 1;
  const unit = item.unit || product.unit || 'kg';
  const price = item.price_at_order || item.price || product.price || 0;
  const totalPrice = price * quantity;
  
  return (
    <div className={`flex items-center gap-4 p-3 bg-gray-50 rounded-lg ${className}`}>
      {product.image ? (
        <img 
          src={product.image} 
          alt={product.name || item.product_name_at_order}
          className="w-16 h-16 rounded-lg object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xs">No img</span>
        </div>
      )}
      
      <div className="flex-1">
        <p className="font-medium">{product.name || item.product_name_at_order || 'Product'}</p>
        <p className="text-sm text-muted-foreground">
          {formatQuantity(quantity, unit)} × {formatPricePerUnit(price, unit)}
        </p>
      </div>
      
      <p className="font-bold text-primary">₹{totalPrice.toFixed(0)}</p>
    </div>
  );
};

export default CartItem;
