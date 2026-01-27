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
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
    active: product?.active !== false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        await axios.put(`${API}/products/${product.id}`, formData);
        toast.success('Product updated successfully', {
          description: `${formData.name} has been saved.`
        });
      } else {
        await axios.post(`${API}/products`, formData);
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
          placeholder="Number of packs available"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          data-testid="product-active-switch"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label className="text-sm">Active</Label>
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
      // Sort by created_at descending (recent first)
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setProducts(sorted);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" data-testid="admin-products-grid">
          {products.map((product) => (
            <Card key={product.id} data-testid={`admin-product-card-${product.id}`}>
              <CardContent className="p-4 sm:p-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3 sm:mb-4"
                />
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="text-base sm:text-xl font-semibold text-primary heading-text truncate">{product.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{product.benefit}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg sm:text-2xl font-bold text-primary">₹{product.price}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{product.growth_days} days</span>
                </div>
                <div className="mb-3 sm:mb-4">
                  <span className={`text-xs sm:text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    Stock: {product.stock} packs
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    data-testid={`edit-product-button-${product.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(product)}
                    className="flex-1 rounded-full text-xs sm:text-sm"
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    data-testid={`delete-product-button-${product.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 rounded-full text-destructive text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
