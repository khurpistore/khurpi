import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Sparkles, Truck, Tag, Zap, Sprout, Clock, XCircle, CalendarPlus, Search, X, Filter, Grid, List, BadgePercent } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWholesale } from '@/hooks/useWholesale';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, addDays } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate quantity options based on unit type
const getQtyOptions = (product) => {
  const unit = product.unit || 'kg';
  const minQty = product.min_quantity || 0.25;
  const stepQty = product.step_quantity || 0.25;
  const maxQty = product.stock_quantity || 10;
  
  if (unit === 'piece' || unit === 'dozen' || unit === 'bunch') {
    // For non-weight items: 1, 2, 3, 4, 5, 6, 10, 12
    return [1, 2, 3, 4, 5, 6, 10, 12].filter(q => q <= maxQty);
  }
  
  // For weight-based items (kg)
  const options = [];
  for (let qty = minQty; qty <= Math.min(maxQty, 5); qty += stepQty) {
    options.push(parseFloat(qty.toFixed(2)));
  }
  return options.length > 0 ? options : [0.25, 0.5, 1];
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wholesaleEnabled, getDisplayPrice, isShowingWholesale } = useWholesale();
  const { trackPageView, trackProductView, trackAddToCart } = useAnalytics();

  useEffect(() => {
    trackPageView('Products');
    fetchData();
    
    // Check URL params for category filter
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    // Check URL params for search
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`)
      ]);
      
      // Sort products by stock status priority
      const sortedProducts = productsRes.data.sort((a, b) => {
        const statusPriority = { 'in_stock': 0, 'growing': 1, 'out_of_stock': 2 };
        const getStatus = (product) => {
          const status = product.stock_status || 'in_stock';
          if (status === 'out_of_stock') return 'out_of_stock';
          if (status === 'growing') return 'growing';
          return 'in_stock';
        };
        return (statusPriority[getStatus(a)] || 0) - (statusPriority[getStatus(b)] || 0);
      });
      
      setProducts(sortedProducts);
      setCategories(categoriesRes.data);
      
      // Initialize quantities
      const initialQty = {};
      sortedProducts.forEach(p => {
        const options = getQtyOptions(p);
        initialQty[p.id] = options[1] || options[0] || 1; // Default to second option or first
      });
      setSelectedQty(initialQty);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.benefit?.toLowerCase().includes(query) ||
        p.nutrients?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === selectedCategory);
    }
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
        break;
      case 'price-high':
        result.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep stock status sorting
        break;
    }
    
    return result;
  }, [products, searchQuery, selectedCategory, sortBy, wholesaleEnabled]);

  const getStockStatus = (product) => {
    const status = product.stock_status || 'in_stock';
    if (status === 'out_of_stock') {
      return { status: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    }
    if (status === 'growing') {
      const readyDate = product.availability_date 
        ? new Date(product.availability_date) 
        : addDays(new Date(), product.ready_in_days || product.growth_days || 7);
      return { 
        status: 'growing', 
        label: `Ready ${format(readyDate, 'MMM d')}`, 
        color: 'bg-amber-100 text-amber-700',
        date: readyDate
      };
    }
    return { status: 'in_stock', label: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  const formatPrice = (product, qty) => {
    const price = getDisplayPrice(product);
    const unit = product.unit || 'kg';
    
    if (unit === 'piece' || unit === 'dozen' || unit === 'bunch') {
      return `₹${(price * qty).toFixed(0)}`;
    }
    // Price per kg, qty in kg
    return `₹${(price * qty).toFixed(0)}`;
  };

  const formatUnitPrice = (product) => {
    const price = getDisplayPrice(product);
    const unit = product.unit || 'kg';
    const priceUnit = product.price_per || unit;
    
    return `₹${price}/${priceUnit}`;
  };

  const handleAddToCart = (product) => {
    const stockInfo = getStockStatus(product);
    if (stockInfo.status === 'out_of_stock') {
      toast.error('This product is currently out of stock');
      return;
    }

    const qty = selectedQty[product.id] || 1;
    const unit = product.unit || 'kg';
    
    const productWithDetails = {
      ...product,
      selectedQty: qty,
      displayPrice: getDisplayPrice(product),
      isGrowing: stockInfo.status === 'growing',
      deliveryDays: stockInfo.status === 'growing' 
        ? (product.ready_in_days || product.growth_days) 
        : 0,
      isWholesale: isShowingWholesale(product)
    };

    trackAddToCart(product.id, product.name, qty);
    addToCart(productWithDetails, 1);
    
    const qtyLabel = unit === 'kg' ? `${qty} kg` : `${qty} ${unit}`;
    toast.success(`${product.name} (${qtyLabel}) added to cart`);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('default');
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Fresh Products</h1>
          <p className="text-green-100">Farm fresh vegetables, fruits & more delivered to your door</p>
          
          {/* Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for vegetables, fruits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 py-6 rounded-full bg-white text-gray-900 border-0 shadow-lg"
              data-testid="product-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick('all')}
                className="rounded-full whitespace-nowrap"
                data-testid="category-all"
              >
                All Products
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="rounded-full whitespace-nowrap"
                  data-testid={`category-${cat.slug || cat.id}`}
                >
                  {cat.image && (
                    <img src={cat.image} alt="" className="w-4 h-4 rounded-full mr-1.5 object-cover" />
                  )}
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">
                <X className="w-3 h-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Availability</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Wholesale Badge */}
        {wholesaleEnabled && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Wholesale prices applied to your account</span>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button onClick={clearFilters}>View all products</Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const stockInfo = getStockStatus(product);
              const qty = selectedQty[product.id] || 1;
              const unit = product.unit || 'kg';
              const isOutOfStock = stockInfo.status === 'out_of_stock';
              const showWholesale = isShowingWholesale(product);

              return (
                <Card 
                  key={product.id} 
                  data-testid={`product-card-${product.id}`}
                  className={`overflow-hidden group transition-all hover:shadow-lg ${isOutOfStock ? 'opacity-75' : ''}`}
                >
                  <div 
                    className="relative aspect-square cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${isOutOfStock ? 'grayscale' : ''}`}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`${stockInfo.color} border-0`}>
                        {stockInfo.status === 'growing' && <Sprout className="w-3 h-3 mr-1" />}
                        {stockInfo.label}
                      </Badge>
                    </div>
                    
                    {/* Wholesale Badge */}
                    {showWholesale && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-orange-500 text-white border-0">
                          <BadgePercent className="w-3 h-3 mr-1" />
                          WP
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <h3 
                      className="font-semibold text-sm mb-1 line-clamp-1 cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.benefit}</p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-primary">{formatUnitPrice(product)}</span>
                      {product.wholesale_price > 0 && !showWholesale && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{product.price}/{product.price_per || unit}
                        </span>
                      )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    {!isOutOfStock && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(qty)}
                          onValueChange={(v) => setSelectedQty(prev => ({ ...prev, [product.id]: parseFloat(v) }))}
                        >
                          <SelectTrigger className="h-8 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getQtyOptions(product).map(q => (
                              <SelectItem key={q} value={String(q)}>
                                {unit === 'kg' ? `${q} kg` : `${q} ${unit}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                          className="h-8 px-3"
                          data-testid={`add-to-cart-${product.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {isOutOfStock && (
                      <Button variant="outline" size="sm" className="w-full h-8" disabled>
                        <XCircle className="w-3 h-3 mr-1" />
                        Out of Stock
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredProducts.map(product => {
              const stockInfo = getStockStatus(product);
              const qty = selectedQty[product.id] || 1;
              const unit = product.unit || 'kg';
              const isOutOfStock = stockInfo.status === 'out_of_stock';
              const showWholesale = isShowingWholesale(product);

              return (
                <Card key={product.id} className={`overflow-hidden ${isOutOfStock ? 'opacity-75' : ''}`}>
                  <CardContent className="p-3 flex gap-4">
                    <div 
                      className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className={`w-full h-full object-cover rounded-lg ${isOutOfStock ? 'grayscale' : ''}`}
                      />
                      {showWholesale && (
                        <Badge className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1">WP</Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold cursor-pointer hover:text-primary" onClick={() => navigate(`/products/${product.id}`)}>
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{product.benefit}</p>
                        </div>
                        <Badge className={`${stockInfo.color} border-0 flex-shrink-0`}>
                          {stockInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-lg text-primary">{formatUnitPrice(product)}</span>
                        
                        {!isOutOfStock && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={String(qty)}
                              onValueChange={(v) => setSelectedQty(prev => ({ ...prev, [product.id]: parseFloat(v) }))}
                            >
                              <SelectTrigger className="h-8 w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getQtyOptions(product).map(q => (
                                  <SelectItem key={q} value={String(q)}>
                                    {unit === 'kg' ? `${q} kg` : `${q} ${unit}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button size="sm" onClick={() => handleAddToCart(product)}>
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
