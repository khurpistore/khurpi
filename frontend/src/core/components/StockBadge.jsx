/**
 * StockBadge Component - Reusable stock status badge
 * Used across customer, vendor, delivery, and admin parts
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sprout, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { getStockStatus } from '../utils';
import { STOCK_STATUS } from '../constants';

const StatusIcons = {
  [STOCK_STATUS.IN_STOCK]: CheckCircle,
  [STOCK_STATUS.GROWING]: Sprout,
  [STOCK_STATUS.LOW_STOCK]: AlertTriangle,
  [STOCK_STATUS.OUT_OF_STOCK]: Package
};

/**
 * StockBadge - Shows stock status with icon
 */
export const StockBadge = ({ 
  product, 
  showIcon = true,
  size = 'default', // 'sm' | 'default' | 'lg'
  className = '' 
}) => {
  const stockInfo = getStockStatus(product);
  const Icon = StatusIcons[stockInfo.status] || Package;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };
  
  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    default: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  return (
    <Badge className={`${stockInfo.color} border-0 ${sizeClasses[size]} ${className}`}>
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {stockInfo.label}
    </Badge>
  );
};

/**
 * StockIndicator - Minimal dot indicator
 */
export const StockIndicator = ({ product, className = '' }) => {
  const stockInfo = getStockStatus(product);
  
  const dotColors = {
    [STOCK_STATUS.IN_STOCK]: 'bg-green-500',
    [STOCK_STATUS.GROWING]: 'bg-amber-500',
    [STOCK_STATUS.LOW_STOCK]: 'bg-orange-500',
    [STOCK_STATUS.OUT_OF_STOCK]: 'bg-red-500'
  };
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dotColors[stockInfo.status]}`} />
      <span className="text-xs text-muted-foreground">{stockInfo.label}</span>
    </div>
  );
};

/**
 * GrowingBadge - Special badge for growing products with delivery info
 */
export const GrowingBadge = ({ product, className = '' }) => {
  const stockInfo = getStockStatus(product);
  
  if (stockInfo.status !== STOCK_STATUS.GROWING) return null;
  
  const days = product?.ready_in_days || product?.growth_days;
  
  return (
    <div className={`flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded ${className}`}>
      <Sprout className="w-3 h-3" />
      <span className="text-xs font-medium">
        {days ? `Ready in ${days} days` : 'Growing'}
      </span>
    </div>
  );
};

export default StockBadge;
