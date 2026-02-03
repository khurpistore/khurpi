import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, Repeat, Package, Clock, Sprout, Edit2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

// Generate quantity options: 100-1000 (step 100), 1500-5000 (step 500)
const getQtyOptions = (maxQty) => {
  const options = [
    ...Array.from({ length: 10 }, (_, i) => (i + 1) * 100),  // 100-1000
    ...Array.from({ length: 8 }, (_, i) => 1500 + i * 500),   // 1500-5000
  ];
  return options.filter(q => q <= maxQty);
};

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateSelectedQty, removeFromCart, getCartTotal, clearCart, pendingSubscription, clearSubscription } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const hasItems = cartItems.length > 0 || pendingSubscription;

  if (!hasItems) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-primary mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6 text-center text-sm">
          Browse our fresh microgreens and add some to your cart
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/products')} className="bg-primary hover:bg-primary/90 rounded-full px-6">
            Buy Once
          </Button>
          <Button onClick={() => navigate('/subscription/create')} variant="outline" className="rounded-full px-6">
            Subscribe & Save
          </Button>
        </div>
      </div>
    );
  }

  const cartTotal = getCartTotal();
  const subscriptionTotal = pendingSubscription?.monthlyTotal || 0;
  const grandTotal = cartTotal + subscriptionTotal;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Order Items</h3>
              </div>

              {/* Subscription Section */}
              {pendingSubscription && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm text-green-800">Subscription</span>
                      <span className="text-xs text-green-600">({pendingSubscription.products?.length || 0} items)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                        {pendingSubscription.plan?.name}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/subscription/create?edit=true')} className="h-6 px-1.5">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearSubscription} className="text-red-500 hover:text-red-600 h-6 px-1.5">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pendingSubscription.products?.map((product) => {
                      const qty = product.selectedQty || 100;
                      const price = (product.price / 100) * qty;
                      return (
                        <div key={product.id || product.product_id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium truncate block">{product.name}</span>
                            <span className="text-xs text-muted-foreground">₹{product.price}/100gm • {qty}gm - ₹{price.toFixed(0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-green-700">
                      <Clock className="w-3 h-3" />
                      <span>Starts: {pendingSubscription.startDate}</span>
                      <span className="mx-1">•</span>
                      <span>Days: {pendingSubscription.deliveryDays?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Per Delivery</span>
                      <span className="font-medium text-green-700">₹{pendingSubscription.perDeliveryTotal?.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Monthly ({pendingSubscription.deliveriesPerWeek || 1} day/week × 4 weeks)</span>
                      <span className="font-semibold text-green-700">₹{pendingSubscription.monthlyTotal?.toFixed(0)}/mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* One-time Items */}
              {cartItems.length > 0 && (
                <div className="space-y-2">
                  {pendingSubscription && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">One-time Purchase</p>
                  )}
                  {cartItems.map((item) => {
                    const isGrowing = item.product.isGrowing || item.product.stock_status === 'growing';
                    const selectedQty = item.product.selectedQty || 100;
                    const unitPrice = (item.product.price / 100) * selectedQty;
                    
                    return (
                      <div key={item.product.id} data-testid={`cart-item-${item.product.id}`} className={`flex items-center gap-2 p-2 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'}`}>
                        <div className="relative">
                          <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                          {isGrowing && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                              <Sprout className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">₹{item.product.price}/100gm</p>
                        </div>
                        {/* Weight Dropdown */}
                        <div className="flex items-center gap-1">
                          <Select
                            value={String(selectedQty)}
                            onValueChange={(value) => updateSelectedQty(item.product.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-20 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getQtyOptions(item.product.weight || 5000).map((qty) => (
                                <SelectItem key={qty} value={String(qty)}>
                                  {qty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground">gm</span>
                        </div>
                        <span className="text-sm font-medium">₹{unitPrice.toFixed(0)}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-600 h-6 px-1">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                  
                  {/* Show overall delivery date for one-time items */}
                  {(() => {
                    let latestDeliveryDate = addDays(new Date(), 1);
                    if (latestDeliveryDate.getDay() === 0) latestDeliveryDate = addDays(latestDeliveryDate, 1);
                    
                    cartItems.forEach(item => {
                      const isGrowing = item.product.isGrowing || item.product.stock_status === 'growing';
                      let itemDelivery;
                      
                      if (isGrowing) {
                        if (item.product.availability_date) {
                          // availability_date + 1 day, skip Sunday
                          itemDelivery = addDays(new Date(item.product.availability_date), 1);
                        } else {
                          const readyDays = item.product.deliveryDays || item.product.ready_in_days || item.product.growth_days || 7;
                          itemDelivery = addDays(new Date(), readyDays + 1);
                        }
                        // Skip Sunday
                        if (itemDelivery.getDay() === 0) itemDelivery = addDays(itemDelivery, 1);
                      } else {
                        // In-stock: next day delivery, skip Sunday
                        itemDelivery = addDays(new Date(), 1);
                        if (itemDelivery.getDay() === 0) itemDelivery = addDays(itemDelivery, 1);
                      }
                      
                      if (itemDelivery > latestDeliveryDate) {
                        latestDeliveryDate = itemDelivery;
                      }
                    });
                    
                    return (
                      <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">Estimated Delivery</span>
                        </div>
                        <span className="text-xs font-semibold text-green-800">{format(latestDeliveryDate, 'MMM d, yyyy')}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Compact Sticky */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              
              <div className="space-y-2 text-sm">
                {cartItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">One-time Items</span>
                    <span>₹{cartTotal.toFixed(0)}</span>
                  </div>
                )}
                {pendingSubscription && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subscription (monthly)</span>
                    <span>₹{subscriptionTotal.toFixed(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{grandTotal.toFixed(0)}
                    {pendingSubscription && !cartItems.length && <span className="text-sm font-normal">/mo</span>}
                  </span>
                </div>
              </div>

              <Button
                data-testid="checkout-button"
                onClick={handleCheckout}
                className="w-full mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-full"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="mt-3 text-center">
                <Button variant="link" size="sm" onClick={() => navigate('/products')} className="text-xs text-muted-foreground">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
