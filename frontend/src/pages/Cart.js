import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Calendar, Repeat, Package, Truck, Clock, Sprout, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, pendingSubscription, clearSubscription } = useCart();
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
          
          {/* Subscription Section - Compact */}
          {pendingSubscription && (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-teal-50" data-testid="subscription-cart-item">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Repeat className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Monthly Subscription</h3>
                      <p className="text-xs text-muted-foreground">{pendingSubscription.plan?.name} Plan • {pendingSubscription.deliveriesPerWeek}×/week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/subscription/create?edit=true')} className="h-8 px-2">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSubscription} className="text-red-500 hover:text-red-600 h-8 px-2">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Products - Compact Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {pendingSubscription.products?.map((product) => (
                    <div key={product.id || product.product_id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">×{product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Details Row */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Starts {pendingSubscription.startDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>Days: {pendingSubscription.deliveryDays?.join(', ')}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-green-200">
                  <span className="text-sm text-muted-foreground">Monthly Total</span>
                  <span className="text-lg font-bold text-green-600">₹{pendingSubscription.monthlyTotal?.toFixed(0)}/mo</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* One-time Purchase Items - Compact */}
          {cartItems.length > 0 && (
            <>
              {pendingSubscription && (
                <div className="flex items-center gap-2 mt-4 mb-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">One-time Purchase</h3>
                </div>
              )}
              
              <Card>
                <CardContent className="p-0 divide-y">
                  {cartItems.map((item) => {
                    const isGrowing = item.product.isGrowing || item.product.stock_status === 'growing';
                    const deliveryDays = item.product.deliveryDays || item.product.ready_in_days || item.product.growth_days;
                    const estimatedDelivery = addDays(new Date(), deliveryDays);
                    
                    return (
                      <div key={item.product.id} data-testid={`cart-item-${item.product.id}`} className={`p-3 flex gap-3 ${isGrowing ? 'bg-amber-50/50' : ''}`}>
                        <div className="relative">
                          <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                          {isGrowing && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                              <Sprout className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                          <p className="text-xs text-muted-foreground">₹{item.product.price} × {item.product.pack_size || '80g'}</p>
                          <div className={`flex items-center gap-1 text-xs mt-1 ${isGrowing ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{isGrowing ? 'Growing - ' : ''}by {format(estimatedDelivery, 'MMM d')}</span>
                          </div>
                          
                          {/* Quantity Controls - Inline */}
                          <div className="flex items-center gap-1 mt-2">
                            <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 p-0">
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 p-0">
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right flex flex-col items-end justify-between">
                          <p className="font-bold text-primary">₹{(item.product.price * item.quantity).toFixed(0)}</p>
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-600 h-7 px-2">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}

          {/* Clear All - Small */}
          {(cartItems.length > 0 || pendingSubscription) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearCart(); clearSubscription(); }}
              className="text-red-500 hover:text-red-600 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
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

              {/* Free Delivery Banner */}
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">Free delivery on all orders!</span>
              </div>

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
