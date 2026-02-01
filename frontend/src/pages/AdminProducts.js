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
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Sprout, XCircle, Clock } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDialog = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    image: product?.image || '',
    benefit: product?.benefit || '',
    nutrients: product?.nutrients || '',
    price: product?.price || '',
    growth_days: product?.growth_days || '',
    pack_size: product?.pack_size || '80g',
    stock: product?.stock || 50,
    active: product?.active !== false,
    stock_status: product?.stock_status || 'in_stock',
    ready_in_days: product?.ready_in_days || '',
    seeds_available: product?.seeds_available !== false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data - only include ready_in_days if status is growing
    const submitData = {
      ...formData,
      ready_in_days: formData.stock_status === 'growing' ? parseInt(formData.ready_in_days) || null : null
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
          <Label htmlFor="growth_days" className="text-sm">Growth Days</Label>
          <Input
            id="growth_days"
            data-testid="product-growth-days-input"
            type="number"
            value={formData.growth_days}
            onChange={(e) => setFormData({ ...formData, growth_days: parseInt(e.target.value) })}
            required
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="pack_size" className="text-sm">Pack Size</Label>
          <Input
            id="pack_size"
            data-testid="product-pack-size-input"
            value={formData.pack_size}
            onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
            placeholder="e.g., 80g, 100g, 50g"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="stock" className="text-sm">Stock Quantity</Label>
          <Input
            id="stock"
            data-testid="product-stock-input"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            required
            className="mt-1"
            placeholder="Number of packs"
          />
        </div>
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
              <SelectItem value="growing">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-amber-600" />
                  Growing - Can be booked
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
            <Label htmlFor="ready_in_days" className="text-xs text-muted-foreground">Ready in (days)</Label>
            <Input
              id="ready_in_days"
              data-testid="ready-in-days-input"
              type="number"
              min="1"
              value={formData.ready_in_days}
              onChange={(e) => setFormData({ ...formData, ready_in_days: e.target.value })}
              placeholder="e.g., 10"
              className="mt-1"
            />
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

const getStockStatusBadge = (product) => {
  const status = product.stock_status || 'in_stock';
  
  if (status === 'in_stock' && product.stock > 0) {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">In Stock</Badge>;
  }
  if (status === 'growing') {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        <Sprout className="w-3 h-3 mr-1" />
        Growing {product.ready_in_days ? `(${product.ready_in_days}d)` : ''}
      </Badge>
    );
  }
  if (status === 'out_of_stock' || product.stock <= 0) {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        <XCircle className="w-3 h-3 mr-1" />
        Out of Stock
      </Badge>
    );
  }
  return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">In Stock</Badge>;
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedProducts, setEditedProducts] = useState({});
  const [saving, setSaving] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?active_only=false`);
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setProducts(sorted);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (productId, field, value) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSaveProduct = async (product) => {
    const changes = editedProducts[product.id];
    if (!changes) return;

    setSaving(prev => ({ ...prev, [product.id]: true }));
    try {
      const updateData = {
        ...product,
        ...changes,
        price: changes.price !== undefined ? parseFloat(changes.price) : product.price,
        growth_days: changes.growth_days !== undefined ? parseInt(changes.growth_days) : product.growth_days,
        stock: changes.stock !== undefined ? parseInt(changes.stock) : product.stock,
        ready_in_days: changes.stock_status === 'growing' ? (parseInt(changes.ready_in_days) || product.ready_in_days) : null
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
      <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="add-product-button"
              onClick={() => openDialog()}
              className="bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto"
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

      {loading ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y" data-testid="admin-products-list">
              {products.map((product) => (
                <div key={product.id} data-testid={`admin-product-row-${product.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  {/* Small Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                      {getStockStatusBadge(product)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{product.benefit}</p>
                  </div>

                  {/* Price & Details */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="font-bold text-primary">₹{product.price}</p>
                    <p className="text-xs text-muted-foreground">{product.pack_size || '80g'} • {product.growth_days}d</p>
                  </div>

                  {/* Stock */}
                  <div className="text-right flex-shrink-0 hidden md:block">
                    <p className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                      {product.stock} packs
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      data-testid={`edit-product-button-${product.id}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => openDialog(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`delete-product-button-${product.id}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
