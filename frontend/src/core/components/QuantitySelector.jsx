/**
 * QuantitySelector Component - Reusable quantity selector
 * Used across customer, vendor, delivery, and admin parts
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { formatQuantity, getQuantityOptions } from '../utils';

/**
 * QuantitySelector - Dropdown style
 */
export const QuantitySelector = ({ 
  product,
  value,
  onChange,
  disabled = false,
  className = '',
  size = 'default' // 'sm' | 'default' | 'lg'
}) => {
  const unit = product?.unit || 'kg';
  const options = getQuantityOptions(product);
  
  const sizeClasses = {
    sm: 'w-20 h-7 text-xs',
    default: 'w-24 h-9 text-sm',
    lg: 'w-28 h-10 text-base'
  };
  
  return (
    <Select
      value={String(value)}
      onValueChange={(val) => onChange(parseFloat(val))}
      disabled={disabled}
    >
      <SelectTrigger className={`${sizeClasses[size]} ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((qty) => (
          <SelectItem key={qty} value={String(qty)}>
            {formatQuantity(qty, unit)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

/**
 * QuantityStepper - Plus/Minus button style
 */
export const QuantityStepper = ({
  product,
  value,
  onChange,
  disabled = false,
  className = '',
  size = 'default'
}) => {
  const unit = product?.unit || 'kg';
  const options = getQuantityOptions(product);
  const currentIndex = options.indexOf(value);
  
  const canDecrement = currentIndex > 0;
  const canIncrement = currentIndex < options.length - 1;
  
  const handleDecrement = () => {
    if (canDecrement) {
      onChange(options[currentIndex - 1]);
    }
  };
  
  const handleIncrement = () => {
    if (canIncrement) {
      onChange(options[currentIndex + 1]);
    }
  };
  
  const sizeClasses = {
    sm: { button: 'h-6 w-6', text: 'text-xs min-w-[50px]' },
    default: { button: 'h-8 w-8', text: 'text-sm min-w-[60px]' },
    lg: { button: 'h-10 w-10', text: 'text-base min-w-[70px]' }
  };
  
  const sizes = sizeClasses[size];
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className={sizes.button}
        onClick={handleDecrement}
        disabled={disabled || !canDecrement}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className={`${sizes.text} text-center font-medium`}>
        {formatQuantity(value, unit)}
      </span>
      <Button
        variant="outline"
        size="icon"
        className={sizes.button}
        onClick={handleIncrement}
        disabled={disabled || !canIncrement}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

/**
 * QuantityInput - Input field style
 */
export const QuantityInput = ({
  product,
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const unit = product?.unit || 'kg';
  const config = { minQty: 0.25, maxQty: 100 }; // Simplified
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || config.minQty)}
        min={config.minQty}
        max={config.maxQty}
        step={product?.step_quantity || 0.25}
        disabled={disabled}
        className="w-20 h-9 px-2 border rounded text-center"
      />
      <span className="text-sm text-muted-foreground">{unit}</span>
    </div>
  );
};

export default QuantitySelector;
