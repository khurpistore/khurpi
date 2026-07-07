import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Image, Link, Calendar, GripVertical, Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_type: 'none',
    link_value: '',
    display_order: 0,
    active: true,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API}/admin/banners`);
      setBanners(res.data);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image_url) {
      toast.error('Title and Image URL are required');
      return;
    }

    try {
      if (editingBanner) {
        await axios.put(`${API}/admin/banners/${editingBanner.id}`, formData);
        toast.success('Banner updated successfully');
      } else {
        await axios.post(`${API}/admin/banners`, formData);
        toast.success('Banner created successfully');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save banner');
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await axios.delete(`${API}/admin/banners/${bannerId}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const toggleActive = async (banner) => {
    try {
      await axios.put(`${API}/admin/banners/${banner.id}`, { active: !banner.active });
      fetchBanners();
      toast.success(`Banner ${!banner.active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update banner');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_type: 'none',
      link_value: '',
      display_order: banners.length,
      active: true,
      start_date: '',
      end_date: ''
    });
    setEditingBanner(null);
  };

  const openEditDialog = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_type: banner.link_type || 'none',
      link_value: banner.link_value || '',
      display_order: banner.display_order || 0,
      active: banner.active ?? true,
      start_date: banner.start_date || '',
      end_date: banner.end_date || ''
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Banner Management</h1>
            <p className="text-muted-foreground">Manage homepage banners and promotions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" /> Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Banner title"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Optional subtitle"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Image URL *</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                      required
                    />
                    {formData.image_url && (
                      <div className="mt-2 rounded-lg overflow-hidden border">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-40 object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Link Type</Label>
                    <Select 
                      value={formData.link_type} 
                      onValueChange={(v) => setFormData({ ...formData, link_type: v, link_value: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Link</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="url">External URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.link_type !== 'none' && (
                    <div>
                      <Label>
                        {formData.link_type === 'product' && 'Product ID'}
                        {formData.link_type === 'category' && 'Category ID'}
                        {formData.link_type === 'url' && 'URL'}
                      </Label>
                      <Input
                        value={formData.link_value}
                        onChange={(e) => setFormData({ ...formData, link_value: e.target.value })}
                        placeholder={formData.link_type === 'url' ? 'https://...' : 'Enter ID'}
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  
                  <div>
                    <Label>Start Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banners Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : banners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Banners Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first banner to display on the homepage</p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" /> Add Banner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner, index) => (
              <Card key={banner.id} className={`overflow-hidden ${!banner.active ? 'opacity-60' : ''}`}>
                <div className="relative">
                  <img 
                    src={banner.image_url} 
                    alt={banner.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      banner.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-black/50 text-white">
                      #{banner.display_order}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                  )}
                  {banner.link_type && banner.link_type !== 'none' && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Link className="w-3 h-3" />
                      <span className="capitalize">{banner.link_type}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(banner)}
                    >
                      {banner.active ? (
                        <><EyeOff className="w-4 h-4 mr-1" /> Hide</>
                      ) : (
                        <><Eye className="w-4 h-4 mr-1" /> Show</>
                      )}
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(banner)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminBanners;
