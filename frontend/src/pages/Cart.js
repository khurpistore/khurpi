import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Calendar, Repeat, Package, Tag, Truck, Clock, Sprout } from 'lucide-react';
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
        <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Browse our fresh microgreens and add some to your cart
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/products')}
            className="bg-primary hover:bg-primary/90 rounded-full px-6"
          >
            Buy Once
          </Button>
          <Button
            onClick={() => navigate('/subscription/create')}
            variant="outline"
            className="rounded-full px-6"
          >
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Subscription Section */}
          {pendingSubscription && (
            <Card className="border-2 border-green-200 bg-green-50/30" data-testid="subscription-cart-item">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-lg text-green-800">Monthly Subscription</h3>
                    <Badge className="bg-green-100 text-green-700">
                      {pendingSubscription.plan?.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSubscription}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Products in subscription */}
                <div className="space-y-3 mb-4">
                  <p className="text-xs text-muted-foreground">Products per delivery:</p>
                  {pendingSubscription.products?.map((product) => (
                    <div key={product.id || product.product_id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.pack_size || '80g'} × {product.quantity}
                        </p>
                      </div>
                      <span className="font-medium">₹{(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Subscription Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Starts</p>
                      <p className="font-medium">{pendingSubscription.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Frequency</p>
                      <p className="font-medium">{pendingSubscription.deliveriesPerWeek}×/week</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Days */}
                <div className="mt-3 p-2 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Days</p>
                  <div className="flex flex-wrap gap-1">
                    {pendingSubscription.deliveryDays?.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Complete Calculation Breakdown */}
                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Delivery Cost</span>
                    <span>₹{pendingSubscription.perDeliveryTotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deliveries per week</span>
                    <span>{pendingSubscription.deliveriesPerWeek}×</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weeks per month</span>
                    <span>4×</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2 rounded -mx-2">
                    <span className="font-medium">Monthly Subtotal</span>
                    <span className="font-medium">
                      ₹{pendingSubscription.perDeliveryTotal?.toFixed(2)} × {pendingSubscription.deliveriesPerWeek} × 4 = ₹{(pendingSubscription.perDeliveryTotal * pendingSubscription.deliveriesPerWeek * 4).toFixed(2)}
                    </span>
                  </div>
                  {pendingSubscription.plan?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Plan Discount ({pendingSubscription.plan?.discount}%)
                      </span>
                      <span>-₹{pendingSubscription.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Monthly Total</span>
                    <span className="text-green-600">₹{pendingSubscription.monthlyTotal?.toFixed(2)}/mo</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/subscription/create?edit=true')}
                  className="w-full mt-4"
                >
                  Edit Subscription
                </Button>
              </CardContent>
            </Card>
          )}

          {/* One-time Purchase Items */}
          {cartItems.length > 0 && (
            <>
              {pendingSubscription && (
                <div className="flex items-center gap-2 mt-6 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">One-time Purchase</h3>
                </div>
              )}
              
              {cartItems.map((item) => {
                const isGrowing = item.product.isGrowing || item.product.stock_status === 'growing';
                const deliveryDays = item.product.deliveryDays || item.product.ready_in_days || item.product.growth_days;
                const estimatedDelivery = addDays(new Date(), deliveryDays);
                
                return (
                  <Card key={item.product.id} data-testid={`cart-item-${item.product.id}`} className={isGrowing ? 'border-amber-200' : ''}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-4">
                        <div className="relative">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                          />
                          {isGrowing && (
                            <div className="absolute -top-1 -right-1">
                              <Badge className="bg-amber-500 text-white text-xs px-1">
                                <Sprout className="w-3 h-3" />
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-primary truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            ₹{item.product.price} per {item.product.pack_size || '80g'} pack
                          </p>
                          
                          {/* Delivery Time Info */}
                          <div className={`flex items-center gap-1 text-xs mb-2 ${isGrowing ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            <Clock className="w-3 h-3" />
                            <span>
                              {isGrowing ? 'Growing - ' : ''}Delivery by {format(estimatedDelivery, 'MMM d')} ({deliveryDays} days)
                            </span>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold text-primary">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-600 mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}

          {(cartItems.length > 0 || pendingSubscription) && (
            <Button
              variant="outline"
              onClick={() => {
                clearCart();
                clearSubscription();
              }}
              className="text-red-500 hover:text-red-600"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-2 text-sm mb-4">
                {cartItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">One-time Items</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                )}
                {pendingSubscription && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subscription (monthly)</span>
                    <span>₹{subscriptionTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{grandTotal.toFixed(2)}
                    {pendingSubscription && !cartItems.length && <span className="text-sm font-normal">/mo</span>}
                  </span>
                </div>
                {pendingSubscription && cartItems.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    + ₹{subscriptionTotal.toFixed(2)}/month for subscription
                  </p>
                )}
              </div>

              <Button
                data-testid="checkout-button"
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary/90 rounded-full"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => navigate('/products')}
                  className="text-sm"
                >
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
