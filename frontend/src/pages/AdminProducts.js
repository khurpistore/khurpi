import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, LayoutDashboard, Package, Users, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSidebar = ({ active, navigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Users, path: '/admin/subscriptions' },
    { id: 'deliveries', label: 'Deliveries', icon: TrendingUp, path: '/admin/deliveries' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/admin/inventory' }
  ];

  return (
    <div className="w-64 bg-primary text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8 heading-text">Khurpi Admin</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active === item.id ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const ProductDialog = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    image: product?.image || '',
    benefit: product?.benefit || '',
    price: product?.price || '',
    growth_days: product?.growth_days || '',
    active: product?.active !== false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        await axios.put(`${API}/products/${product.id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, formData);
        toast.success('Product created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
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
        <Label htmlFor="image">Image URL</Label>
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
        <Label htmlFor="benefit">Benefit</Label>
        <Textarea
          id="benefit"
          data-testid="product-benefit-input"
          value={formData.benefit}
          onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="price">Price (₹)</Label>
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
        <Label htmlFor="growth_days">Growth Days</Label>
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
      <div className="flex items-center gap-2">
        <Switch
          data-testid="product-active-switch"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label>Active</Label>
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

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
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
    <div className="flex min-h-screen">
      <AdminSidebar active="products" navigate={navigate} />
      <div className="flex-1 p-8 bg-background">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary heading-text">Manage Products</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-product-button"
                onClick={() => openDialog()}
                className="bg-primary hover:bg-primary/90 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="admin-products-grid">
            {products.map((product) => (
              <Card key={product.id} data-testid={`admin-product-card-${product.id}`}>
                <CardContent className="p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-primary heading-text">{product.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{product.benefit}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                    <span className="text-sm text-muted-foreground">{product.growth_days} days</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid={`edit-product-button-${product.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(product)}
                      className="flex-1 rounded-full"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      data-testid={`delete-product-button-${product.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 rounded-full text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;