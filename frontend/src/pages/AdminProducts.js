import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Sprout, XCircle, Clock, CalendarIcon } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

// Import from core module - Single source of truth
import { StockBadge, getStockStatus } from '../core';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Weight options: 0, 25, 50, 100-1000 (step 100), 1500-5000 (step 500)
const WEIGHT_OPTIONS = [
  0,  // Out of stock
  25, // 25gm
  50, // 50gm
  ...Array.from({ length: 10 }, (_, i) => (i + 1) * 100),  // 100-1000
  ...Array.from({ length: 8 }, (_, i) => 1500 + i * 500),   // 1500-5000
];

// Unit type options for products
const UNIT_TYPE_OPTIONS = [
  { value: 'g', label: 'G' },
  { value: 'kg', label: 'Kg' },
  { value: 'piece', label: 'Piece' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'dozen', label: 'Dozen' },
];

const ProductDialog = ({ product, onClose, onSuccess }) => {
  // Calculate initial availability date from ready_in_days if exists
  const getInitialAvailabilityDate = () => {
    if (product?.availability_date) {
      return new Date(product.availability_date);
    }
    if (product?.ready_in_days) {
      return addDays(new Date(), product.ready_in_days);
    }
    return addDays(new Date(), 7); // Default 7 days from now
  };

  const [formData, setFormData] = useState({
    name: product?.name || '',
    image: product?.image || '',
    benefit: product?.benefit || '',
    nutrients: product?.nutrients || '',
    price: product?.price || '',
    unit: product?.unit || 'kg',
    unit_value: product?.unit_value ?? 1,
    weight: product?.weight || 100,
    active: product?.active !== false,
    stock_status: product?.stock_status || 'in_stock',
    availability_date: getInitialAvailabilityDate(),
    seeds_available: product?.seeds_available !== false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data - convert availability_date to ready_in_days if status is growing
    const submitData = {
      ...formData,
      ready_in_days: formData.stock_status === 'growing' 
        ? differenceInDays(formData.availability_date, new Date()) 
        : null,
      availability_date: formData.stock_status === 'growing'
        ? formData.availability_date.toISOString()
        : null
    };

    try {
      if (product) {
        await axios.put(`${API}/products/${product.id}`, submitData);
        toast.success('Product updated successfully', {
          description: `${formData.name} has been saved.`
        });
      } else {
        await axios.post(`${API}/products`, submitData);
        toast.success('Product created successfully', {
          description: `${formData.name} is now available.`
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Operation failed', {
        description: error.response?.data?.detail || 'Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label htmlFor="name" className="text-sm">Product Name</Label>
        <Input
          id="name"
          data-testid="product-name-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="image" className="text-sm">Image URL</Label>
        <Input
          id="image"
          data-testid="product-image-input"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="benefit" className="text-sm">Health Benefit</Label>
        <Textarea
          id="benefit"
          data-testid="product-benefit-input"
          value={formData.benefit}
          onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
          required
          className="mt-1 min-h-[60px]"
        />
      </div>
      <div>
        <Label htmlFor="nutrients" className="text-sm">Nutritional Profile</Label>
        <Textarea
          id="nutrients"
          data-testid="product-nutrients-input"
          value={formData.nutrients}
          onChange={(e) => setFormData({ ...formData, nutrients: e.target.value })}
          placeholder="Vitamins: A, C, K | Minerals: Calcium, Iron"
          className="mt-1 min-h-[60px]"
        />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="price" className="text-sm">Price (₹)</Label>
          <Input
            id="price"
            data-testid="product-price-input"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="unit_value" className="text-sm">Unit</Label>
          <Input
            id="unit_value"
            data-testid="product-unit-value-input"
            type="number"
            step="0.01"
            value={formData.unit_value}
            onChange={(e) => setFormData({ ...formData, unit_value: parseFloat(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="unit" className="text-sm">Unit Type</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger className="mt-1" data-testid="product-unit-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_TYPE_OPTIONS.map((u) => (
                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="weight" className="text-sm">Available Qty (gm)</Label>
        <Select
          value={String(formData.weight)}
          onValueChange={(value) => setFormData({ ...formData, weight: parseInt(value) })}
        >
          <SelectTrigger className="mt-1" data-testid="product-weight-select">
            <SelectValue placeholder="Select quantity" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {WEIGHT_OPTIONS.map((w) => (
              <SelectItem key={w} value={String(w)}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Stock Availability Section */}
      <div className="p-3 bg-slate-50 rounded-lg space-y-3">
        <Label className="text-sm font-semibold">Stock Availability</Label>
        <div>
          <Label htmlFor="stock_status" className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={formData.stock_status}
            onValueChange={(value) => setFormData({ ...formData, stock_status: value })}
          >
            <SelectTrigger className="mt-1" data-testid="stock-status-select">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_stock">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  In Stock - Ready to ship
                </div>
              </SelectItem>
              <SelectItem value="out_of_stock">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Out of Stock - Not available
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.stock_status === 'growing' && (
          <div>
            <Label className="text-xs text-muted-foreground">Availability Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal"
                  data-testid="availability-date-picker"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.availability_date ? format(formData.availability_date, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.availability_date}
                  onSelect={(date) => setFormData({ ...formData, availability_date: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.availability_date && `Ready in ${differenceInDays(formData.availability_date, new Date())} days`}
            </p>
          </div>
        )}
        
        {formData.stock_status === 'out_of_stock' && (
          <div className="flex items-center gap-2">
            <Switch
              data-testid="seeds-available-switch"
              checked={formData.seeds_available}
              onCheckedChange={(checked) => setFormData({ ...formData, seeds_available: checked })}
            />
            <Label className="text-xs">Seeds available for future growing</Label>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          data-testid="product-active-switch"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label className="text-sm">Active (visible to customers)</Label>
      </div>
      <Button
        data-testid="save-product-button"
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 rounded-full"
      >
        {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
};

// Use core module's StockBadge component for consistency
const getStockStatusBadge = (product) => {
  return <StockBadge product={product} size="default" />;
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedProducts, setEditedProducts] = useState({});
  const [saving, setSaving] = useState({});
  const [costData, setCostData] = useState({});
  const [monthlyTrays, setMonthlyTrays] = useState(100);
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to be resolved before fetching
    if (authLoading) return;
    fetchProducts();
    fetchCostSettings();
  }, [authLoading]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?active_only=false`);
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setProducts(sorted);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCostSettings = async () => {
    try {
      // First get the saved monthly trays setting
      const settingsRes = await axios.get(`${API}/admin/cost-calculator/settings`);
      const trays = settingsRes.data?.monthly_production_trays || 100;
      setMonthlyTrays(trays);
      
      // Then fetch cost data using the saved setting
      fetchCostData(trays);
    } catch (error) {
      console.log('Cost settings not available, using default');
      fetchCostData(100);
    }
  };

  const fetchCostData = async (trays) => {
    try {
      const response = await axios.get(`${API}/admin/cost-calculator/calculate?monthly_production_trays=${trays}`);
      // Create a map of product_id -> cost data
      const costMap = {};
      if (response.data?.product_costs) {
        response.data.product_costs.forEach(pc => {
          // Cost per 50g = cost_per_100g / 2
          costMap[pc.product_id] = {
            cost_per_50g: (pc.unit_costs?.cost_per_100g / 2) || 0,
            cost_per_100g: pc.unit_costs?.cost_per_100g || 0
          };
        });
      }
      setCostData(costMap);
    } catch (error) {
      console.log('Cost calculator data not available');
    }
  };

  const handleFieldChange = (productId, field, value) => {
    setEditedProducts(prev => {
      const updates = {
        ...prev[productId],
        [field]: value
      };
      
      // Auto-update stock_status when weight is set to 0
      if (field === 'weight' && parseInt(value) === 0) {
        updates.stock_status = 'out_of_stock';
      }
      
      return {
        ...prev,
        [productId]: updates
      };
    });
  };

  const handleSaveProduct = async (product) => {
    const changes = editedProducts[product.id];
    if (!changes) return;

    setSaving(prev => ({ ...prev, [product.id]: true }));
    try {
      const weight = changes.weight !== undefined ? parseInt(changes.weight) : (product.weight || 100);
      // Auto-update stock status to out_of_stock if weight is 0
      let stockStatus = changes.stock_status !== undefined ? changes.stock_status : product.stock_status;
      if (weight === 0) {
        stockStatus = 'out_of_stock';
      }
      
      const updateData = {
        ...product,
        ...changes,
        price: changes.price !== undefined ? parseFloat(changes.price) : product.price,
        growth_days: changes.growth_days !== undefined ? parseInt(changes.growth_days) : product.growth_days,
        weight: weight,
        stock_status: stockStatus,
        ready_in_days: stockStatus === 'growing' 
          ? (changes.ready_in_days !== undefined ? parseInt(changes.ready_in_days) : product.ready_in_days) 
          : null,
        availability_date: stockStatus === 'growing'
          ? (changes.availability_date || product.availability_date)
          : null
      };
      await axios.put(`${API}/products/${product.id}`, updateData);
      toast.success(`${product.name} updated`);
      setEditedProducts(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleSaveAll = async () => {
    const productIds = Object.keys(editedProducts);
    if (productIds.length === 0) {
      toast.info('No changes to save');
      return;
    }

    for (const productId of productIds) {
      const product = products.find(p => p.id === productId);
      if (product) {
        await handleSaveProduct(product);
      }
    }
    toast.success('All changes saved');
  };

  const getFieldValue = (product, field) => {
    return editedProducts[product.id]?.[field] !== undefined 
      ? editedProducts[product.id][field] 
      : product[field];
  };

  const hasChanges = (productId) => {
    return editedProducts[productId] && Object.keys(editedProducts[productId]).length > 0;
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openDialog = (product = null) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  return (
    <AdminLayout active="products" title="Manage Products">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        {Object.keys(editedProducts).length > 0 && (
          <Button
            onClick={handleSaveAll}
            className="bg-green-600 hover:bg-green-700 rounded-full"
          >
            Save All Changes ({Object.keys(editedProducts).length})
          </Button>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="add-product-button"
              onClick={() => openDialog()}
              className="bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto ml-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="heading-text">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <ProductDialog
              product={selectedProduct}
              onClose={() => setDialogOpen(false)}
              onSuccess={fetchProducts}
            />
          </DialogContent>
        </Dialog>
      </div>

      {productsLoading ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden lg:block overflow-x-auto">
            <CardContent className="p-0 min-w-[1100px]">
              {/* Header */}
              <div className="grid gap-1 p-2 bg-gray-100 text-xs font-medium text-gray-600 border-b" style={{gridTemplateColumns: 'repeat(16, minmax(0, 1fr))'}}>
                <div className="col-span-3">Product</div>
                <div className="col-span-2 text-center text-blue-600">Price</div>
                <div className="col-span-1 text-center">Unit</div>
                <div className="col-span-2 text-center">Unit Type</div>
                <div className="col-span-2 text-center">Qty(gm)</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-center">Active</div>
                <div className="col-span-3 text-center">Actions</div>
              </div>

              {/* Product Rows */}
              <div className="divide-y" data-testid="admin-products-list">
                {products.map((product) => (
                  <div key={product.id} data-testid={`admin-product-row-${product.id}`} className={`grid gap-1 p-2 items-center hover:bg-gray-50 ${hasChanges(product.id) ? 'bg-yellow-50' : ''}`} style={{gridTemplateColumns: 'repeat(16, minmax(0, 1fr))'}}>
                    {/* Product Info */}
                    <div className="col-span-3 flex items-center gap-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.benefit?.slice(0, 30)}...</p>
                      </div>
                    </div>

                    {/* Price (editable) */}
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={getFieldValue(product, 'price') ?? product.price ?? ''}
                        onChange={(e) => handleFieldChange(product.id, 'price', parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs text-center bg-blue-50 border-blue-200 text-blue-700"
                        placeholder="0"
                        data-testid={`product-price-${product.id}`}
                      />
                    </div>

                    {/* Unit value */}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={getFieldValue(product, 'unit_value') ?? product.unit_value ?? 1}
                        onChange={(e) => handleFieldChange(product.id, 'unit_value', parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs text-center"
                        placeholder="1"
                        data-testid={`product-unit-value-${product.id}`}
                      />
                    </div>

                    {/* Unit Type */}
                    <div className="col-span-2">
                      <Select
                        value={getFieldValue(product, 'unit') || product.unit || 'kg'}
                        onValueChange={(value) => handleFieldChange(product.id, 'unit', value)}
                      >
                        <SelectTrigger className="h-7 text-xs" data-testid={`product-unit-type-${product.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_TYPE_OPTIONS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Weight (gm) - stock qty */}
                    <div className="col-span-2">
                      <Select
                        value={String(getFieldValue(product, 'weight') ?? 100)}
                        onValueChange={(value) => handleFieldChange(product.id, 'weight', parseInt(value))}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {WEIGHT_OPTIONS.map((w) => (
                            <SelectItem key={w} value={String(w)}>
                              {w === 0 ? '0 (Out)' : w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Stock Status */}
                    <div className="col-span-2">
                      <Select
                        value={getFieldValue(product, 'stock_status') || 'in_stock'}
                        onValueChange={(value) => handleFieldChange(product.id, 'stock_status', value)}
                      >
                        <SelectTrigger className={`h-7 text-xs ${
                          (getFieldValue(product, 'stock_status') || 'in_stock') === 'in_stock'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_stock">
                            <span className="text-green-700">In Stock</span>
                          </SelectItem>
                          <SelectItem value="out_of_stock">
                            <span className="text-red-700">Out of Stock</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active Toggle */}
                    <div className="col-span-1 flex justify-center">
                      <Switch
                        checked={getFieldValue(product, 'active') !== false}
                        onCheckedChange={(checked) => handleFieldChange(product.id, 'active', checked)}
                      />
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDialog(product)}
                        className="h-7 w-7 p-0"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(product.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      {hasChanges(product.id) && (
                        <Button
                          size="sm"
                          onClick={() => handleSaveProduct(product)}
                          disabled={saving[product.id]}
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                        >
                          {saving[product.id] ? '...' : 'Save'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3" data-testid="admin-products-mobile">
          {products.map((product) => (
            <Card key={product.id} className={`${hasChanges(product.id) ? 'border-yellow-400 bg-yellow-50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">₹{product.price} / {product.unit || 'kg'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={getFieldValue(product, 'active') !== false}
                          onCheckedChange={(checked) => handleFieldChange(product.id, 'active', checked)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {getStockStatusBadge(product)}
                      <span className="text-xs text-muted-foreground">
                        {getFieldValue(product, 'weight') || 0}gm
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Edit Fields */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Price</Label>
                    <Input
                      type="number"
                      value={getFieldValue(product, 'price')}
                      onChange={(e) => handleFieldChange(product.id, 'price', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Stock (gm)</Label>
                    <Select
                      value={String(getFieldValue(product, 'weight') ?? 100)}
                      onValueChange={(value) => handleFieldChange(product.id, 'weight', parseInt(value))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {WEIGHT_OPTIONS.map((w) => (
                          <SelectItem key={w} value={String(w)}>
                            {w === 0 ? '0' : w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={getFieldValue(product, 'stock_status') || 'in_stock'}
                      onValueChange={(value) => handleFieldChange(product.id, 'stock_status', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(product)}
                      className="h-8"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {hasChanges(product.id) && (
                    <Button
                      size="sm"
                      onClick={() => handleSaveProduct(product)}
                      disabled={saving[product.id]}
                      className="h-8 bg-green-600 hover:bg-green-700"
                    >
                      {saving[product.id] ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
