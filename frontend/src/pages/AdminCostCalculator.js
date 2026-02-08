import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, Plus, Edit2, Trash2, Loader2, IndianRupee, 
  TrendingUp, TrendingDown, Package, Clock, Leaf, Settings,
  DollarSign, Calendar, AlertTriangle, CheckCircle, Percent,
  ChevronRight, Building2, Zap, Droplets, Wrench, Box
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminCostCalculator = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data states
  const [oneTimePurchases, setOneTimePurchases] = useState({ purchases: [], summary: {} });
  const [fixedCosts, setFixedCosts] = useState({ costs: [], summary: {} });
  const [productionCosts, setProductionCosts] = useState({ costs: [], count: 0 });
  const [productConfigs, setProductConfigs] = useState({ configs: [], count: 0 });
  const [calculatedCosts, setCalculatedCosts] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  
  // Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // one-time, fixed, production, product
  const [editingItem, setEditingItem] = useState(null);
  const [monthlyTrays, setMonthlyTrays] = useState(100);
  
  // Form data
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (oneTimePurchases.purchases.length || fixedCosts.costs.length) {
      calculateCosts();
    }
  }, [monthlyTrays]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [oneTimeRes, fixedRes, productionRes, configsRes, productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/admin/cost-calculator/one-time`),
        axios.get(`${API}/admin/cost-calculator/fixed-costs`),
        axios.get(`${API}/admin/cost-calculator/production-costs`),
        axios.get(`${API}/admin/cost-calculator/product-configs`),
        axios.get(`${API}/products`),
        axios.get(`${API}/admin/cost-calculator/categories`)
      ]);
      
      setOneTimePurchases(oneTimeRes.data);
      setFixedCosts(fixedRes.data);
      setProductionCosts(productionRes.data);
      setProductConfigs(configsRes.data);
      setProducts(productsRes.data?.products || productsRes.data || []);
      setCategories(categoriesRes.data);
      
      // Calculate costs
      const calcRes = await axios.get(`${API}/admin/cost-calculator/calculate?monthly_production_trays=${monthlyTrays}`);
      setCalculatedCosts(calcRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load cost data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCosts = async () => {
    try {
      const calcRes = await axios.get(`${API}/admin/cost-calculator/calculate?monthly_production_trays=${monthlyTrays}`);
      setCalculatedCosts(calcRes.data);
    } catch (error) {
      console.error('Error calculating costs:', error);
    }
  };

  const openDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData({ ...item });
    } else {
      // Default values based on type
      if (type === 'one-time') {
        setFormData({
          name: '',
          category: 'equipment',
          purchase_cost: 0,
          purchase_date: format(new Date(), 'yyyy-MM-dd'),
          useful_life_months: 36,
          salvage_value: 0,
          notes: ''
        });
      } else if (type === 'fixed') {
        setFormData({
          name: '',
          category: 'rent',
          monthly_amount: 0,
          notes: ''
        });
      } else if (type === 'production') {
        setFormData({
          name: '',
          category: 'seeds',
          cost_per_unit: 0,
          unit: 'per_tray',
          notes: ''
        });
      } else if (type === 'product') {
        setFormData({
          product_id: '',
          product_name: '',
          trays_per_batch: 1,
          growth_days: 7,
          yield_grams_per_tray: 100,
          seed_cost_per_tray: 0,
          soil_cost_per_tray: 0,
          labor_hours_per_batch: 0.5,
          labor_rate_per_hour: 100,
          packaging_cost_per_unit: 5,
          other_variable_costs: 0,
          notes: ''
        });
      }
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let endpoint = '';
      let method = editingItem ? 'put' : 'post';
      
      if (dialogType === 'one-time') {
        endpoint = editingItem 
          ? `${API}/admin/cost-calculator/one-time/${editingItem.id}`
          : `${API}/admin/cost-calculator/one-time`;
      } else if (dialogType === 'fixed') {
        endpoint = editingItem
          ? `${API}/admin/cost-calculator/fixed-costs/${editingItem.id}`
          : `${API}/admin/cost-calculator/fixed-costs`;
      } else if (dialogType === 'production') {
        endpoint = editingItem
          ? `${API}/admin/cost-calculator/production-costs/${editingItem.id}`
          : `${API}/admin/cost-calculator/production-costs`;
      } else if (dialogType === 'product') {
        endpoint = `${API}/admin/cost-calculator/product-configs`;
        method = 'post'; // Always post for product configs (upsert)
      }
      
      await axios[method](endpoint, formData);
      toast.success(`${editingItem ? 'Updated' : 'Added'} successfully`);
      setDialogOpen(false);
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      let endpoint = '';
      if (type === 'one-time') endpoint = `${API}/admin/cost-calculator/one-time/${id}`;
      else if (type === 'fixed') endpoint = `${API}/admin/cost-calculator/fixed-costs/${id}`;
      else if (type === 'production') endpoint = `${API}/admin/cost-calculator/production-costs/${id}`;
      else if (type === 'product') endpoint = `${API}/admin/cost-calculator/product-configs/${id}`;
      
      await axios.delete(endpoint);
      toast.success('Deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getCategoryLabel = (type, categoryName) => {
    const cats = categories[type] || [];
    const cat = cats.find(c => c.name === categoryName);
    return cat?.label || categoryName;
  };

  if (loading) {
    return (
      <AdminLayout active="cost-calculator" title="Cost Calculator">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="cost-calculator" title="Microgreen Cost Calculator">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="one-time">One-Time</TabsTrigger>
          <TabsTrigger value="fixed">Fixed Costs</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Overhead Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Depreciation</p>
                    <p className="text-xl font-bold">₹{calculatedCosts?.monthly_overhead?.depreciation?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fixed Costs/Month</p>
                    <p className="text-xl font-bold">₹{calculatedCosts?.monthly_overhead?.fixed_costs?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Overhead/Month</p>
                    <p className="text-xl font-bold">₹{calculatedCosts?.monthly_overhead?.total?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Box className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Overhead/Tray</p>
                    <p className="text-xl font-bold">₹{calculatedCosts?.monthly_overhead?.overhead_per_tray?.toFixed(2) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Production Input */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <Label className="font-medium">Monthly Production (Trays):</Label>
                <Input 
                  type="number" 
                  value={monthlyTrays} 
                  onChange={(e) => setMonthlyTrays(parseInt(e.target.value) || 1)}
                  className="w-32"
                  min="1"
                />
                <Button onClick={calculateCosts} variant="outline" size="sm">
                  <Calculator className="w-4 h-4 mr-2" />
                  Recalculate
                </Button>
                <p className="text-sm text-muted-foreground">
                  Higher production = lower overhead per tray
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Costs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Product Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculatedCosts?.product_costs?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium">Product</th>
                        <th className="text-right p-3 font-medium">Cost/100g</th>
                        <th className="text-right p-3 font-medium">Selling Price</th>
                        <th className="text-right p-3 font-medium">Profit/Unit</th>
                        <th className="text-right p-3 font-medium">Margin</th>
                        <th className="text-center p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedCosts.product_costs.map((product, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <p className="font-medium">{product.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.yield.growth_days} days, {product.yield.grams_per_tray}g/tray
                            </p>
                          </td>
                          <td className="p-3 text-right font-medium">
                            ₹{product.unit_costs.cost_per_100g}
                          </td>
                          <td className="p-3 text-right">
                            ₹{product.selling_price}
                          </td>
                          <td className={`p-3 text-right font-medium ${product.profitability.profit_per_unit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{product.profitability.profit_per_unit}
                          </td>
                          <td className="p-3 text-right">
                            <Badge className={product.profitability.margin_percent >= 30 ? 'bg-green-600' : product.profitability.margin_percent >= 15 ? 'bg-amber-500' : 'bg-red-500'}>
                              {product.profitability.margin_percent}%
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {product.profitability.profitable ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No product costs configured yet</p>
                  <Button variant="link" onClick={() => setActiveTab('products')}>
                    Configure Product Costs <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          {calculatedCosts?.summary && (
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-blue-700">{calculatedCosts.summary.products_configured}</p>
                  <p className="text-sm text-blue-600">Products Configured</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">{calculatedCosts.summary.profitable_products}</p>
                  <p className="text-sm text-green-600">Profitable Products</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{calculatedCosts.summary.unprofitable_products}</p>
                  <p className="text-sm text-red-600">Unprofitable Products</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-purple-700">{calculatedCosts.summary.avg_margin}%</p>
                  <p className="text-sm text-purple-600">Average Margin</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* One-Time Purchases Tab */}
        <TabsContent value="one-time" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">One-Time Purchases (Depreciation)</h3>
              <p className="text-sm text-muted-foreground">Equipment and setup costs that depreciate over time</p>
            </div>
            <Button onClick={() => openDialog('one-time')} data-testid="add-one-time-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Purchase
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Purchase Cost</p>
                <p className="text-2xl font-bold">₹{oneTimePurchases.summary.total_purchase_cost?.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Monthly Depreciation</p>
                <p className="text-2xl font-bold text-amber-600">₹{oneTimePurchases.summary.total_monthly_depreciation?.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Current Book Value</p>
                <p className="text-2xl font-bold text-green-600">₹{oneTimePurchases.summary.total_current_value?.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Purchases Table */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Item</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Purchase Cost</th>
                    <th className="text-right p-3 font-medium">Monthly Dep.</th>
                    <th className="text-right p-3 font-medium">Current Value</th>
                    <th className="text-center p-3 font-medium">Life Left</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {oneTimePurchases.purchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No one-time purchases added yet
                      </td>
                    </tr>
                  ) : (
                    oneTimePurchases.purchases.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.purchase_date}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{getCategoryLabel('one_time', item.category)}</Badge>
                        </td>
                        <td className="p-3 text-right">₹{item.purchase_cost?.toLocaleString()}</td>
                        <td className="p-3 text-right text-amber-600">₹{item.monthly_depreciation}</td>
                        <td className="p-3 text-right text-green-600">₹{item.current_value?.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <Badge variant={item.months_remaining > 12 ? 'default' : 'destructive'}>
                            {item.months_remaining} mo
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDialog('one-time', item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete('one-time', item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fixed Costs Tab */}
        <TabsContent value="fixed" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Monthly Fixed Costs</h3>
              <p className="text-sm text-muted-foreground">Recurring monthly expenses (rent, utilities, etc.)</p>
            </div>
            <Button onClick={() => openDialog('fixed')} data-testid="add-fixed-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Fixed Cost
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-200 rounded-full">
                  <IndianRupee className="w-8 h-8 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-purple-600">Total Monthly Fixed Costs</p>
                  <p className="text-4xl font-bold text-purple-700">₹{fixedCosts.summary.total_monthly?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fixedCosts.costs.map((cost) => (
              <Card key={cost.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2">{getCategoryLabel('fixed', cost.category)}</Badge>
                      <p className="font-medium">{cost.name}</p>
                      <p className="text-2xl font-bold mt-1">₹{cost.monthly_amount?.toLocaleString()}</p>
                      {cost.notes && <p className="text-xs text-muted-foreground mt-1">{cost.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDialog('fixed', cost)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete('fixed', cost.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {fixedCosts.costs.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No fixed costs added yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Production Costs Tab */}
        <TabsContent value="production" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Production Cost Items</h3>
              <p className="text-sm text-muted-foreground">Variable costs per tray/batch (seeds, soil, labor, etc.)</p>
            </div>
            <Button onClick={() => openDialog('production')} data-testid="add-production-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Cost Item
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productionCosts.costs.map((cost) => (
              <Card key={cost.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2">{getCategoryLabel('production', cost.category)}</Badge>
                      <p className="font-medium">{cost.name}</p>
                      <p className="text-2xl font-bold mt-1">
                        ₹{cost.cost_per_unit}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          /{cost.unit?.replace('per_', '')}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDialog('production', cost)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete('production', cost.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {productionCosts.costs.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No production cost items added yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Product Configs Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Product Cost Configuration</h3>
              <p className="text-sm text-muted-foreground">Configure specific costs for each microgreen product</p>
            </div>
            <Button onClick={() => openDialog('product')} data-testid="add-product-config-btn">
              <Plus className="w-4 h-4 mr-2" />
              Configure Product
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {productConfigs.configs.map((config) => {
              const productCost = calculatedCosts?.product_costs?.find(p => p.product_id === config.product_id);
              return (
                <Card key={config.product_id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-green-600" />
                        {config.product_name}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDialog('product', config)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete('product', config.product_id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Growth Days</p>
                        <p className="font-medium">{config.growth_days} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Yield/Tray</p>
                        <p className="font-medium">{config.yield_grams_per_tray}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Seed Cost/Tray</p>
                        <p className="font-medium">₹{config.seed_cost_per_tray}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Soil Cost/Tray</p>
                        <p className="font-medium">₹{config.soil_cost_per_tray}</p>
                      </div>
                    </div>
                    {productCost && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-muted-foreground text-sm">Cost per 100g</p>
                            <p className="text-xl font-bold">₹{productCost.unit_costs.cost_per_100g}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">Margin</p>
                            <Badge className={productCost.profitability.margin_percent >= 30 ? 'bg-green-600' : 'bg-amber-500'}>
                              {productCost.profitability.margin_percent}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {productConfigs.configs.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No product costs configured yet</p>
                  <p className="text-sm">Add your microgreen products to calculate their costs</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {
                dialogType === 'one-time' ? 'One-Time Purchase' :
                dialogType === 'fixed' ? 'Fixed Cost' :
                dialogType === 'production' ? 'Production Cost' :
                'Product Configuration'
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* One-Time Purchase Form */}
            {dialogType === 'one-time' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., 4-Tier Rack" />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.one_time?.map(c => <SelectItem key={c.name} value={c.name}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Purchase Cost (₹) *</Label>
                    <Input type="number" value={formData.purchase_cost || 0} onChange={(e) => setFormData({...formData, purchase_cost: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>Purchase Date *</Label>
                    <Input type="date" value={formData.purchase_date || ''} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Useful Life (Months)</Label>
                    <Input type="number" value={formData.useful_life_months || 36} onChange={(e) => setFormData({...formData, useful_life_months: parseInt(e.target.value) || 36})} />
                  </div>
                  <div>
                    <Label>Salvage Value (₹)</Label>
                    <Input type="number" value={formData.salvage_value || 0} onChange={(e) => setFormData({...formData, salvage_value: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </>
            )}

            {/* Fixed Cost Form */}
            {dialogType === 'fixed' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cost Name *</Label>
                    <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Shop Rent" />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.fixed?.map(c => <SelectItem key={c.name} value={c.name}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Monthly Amount (₹) *</Label>
                  <Input type="number" value={formData.monthly_amount || 0} onChange={(e) => setFormData({...formData, monthly_amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </>
            )}

            {/* Production Cost Form */}
            {dialogType === 'production' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Sunflower Seeds" />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.production?.map(c => <SelectItem key={c.name} value={c.name}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cost per Unit (₹) *</Label>
                    <Input type="number" value={formData.cost_per_unit || 0} onChange={(e) => setFormData({...formData, cost_per_unit: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>Unit *</Label>
                    <Select value={formData.unit} onValueChange={(v) => setFormData({...formData, unit: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_tray">Per Tray</SelectItem>
                        <SelectItem value="per_kg">Per KG</SelectItem>
                        <SelectItem value="per_hour">Per Hour</SelectItem>
                        <SelectItem value="per_piece">Per Piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </>
            )}

            {/* Product Config Form */}
            {dialogType === 'product' && (
              <>
                <div>
                  <Label>Select Product *</Label>
                  <Select 
                    value={formData.product_id} 
                    onValueChange={(v) => {
                      const product = products.find(p => p.id === v);
                      setFormData({...formData, product_id: v, product_name: product?.name || ''});
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - ₹{p.price}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Growth Days</Label>
                    <Input type="number" value={formData.growth_days || 7} onChange={(e) => setFormData({...formData, growth_days: parseInt(e.target.value) || 7})} />
                  </div>
                  <div>
                    <Label>Yield per Tray (grams)</Label>
                    <Input type="number" value={formData.yield_grams_per_tray || 100} onChange={(e) => setFormData({...formData, yield_grams_per_tray: parseFloat(e.target.value) || 100})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Seed Cost per Tray (₹)</Label>
                    <Input type="number" value={formData.seed_cost_per_tray || 0} onChange={(e) => setFormData({...formData, seed_cost_per_tray: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>Soil Cost per Tray (₹)</Label>
                    <Input type="number" value={formData.soil_cost_per_tray || 0} onChange={(e) => setFormData({...formData, soil_cost_per_tray: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Labor Hours per Batch</Label>
                    <Input type="number" step="0.1" value={formData.labor_hours_per_batch || 0.5} onChange={(e) => setFormData({...formData, labor_hours_per_batch: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>Labor Rate (₹/hour)</Label>
                    <Input type="number" value={formData.labor_rate_per_hour || 100} onChange={(e) => setFormData({...formData, labor_rate_per_hour: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Packaging Cost per Unit (₹)</Label>
                    <Input type="number" value={formData.packaging_cost_per_unit || 5} onChange={(e) => setFormData({...formData, packaging_cost_per_unit: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>Other Variable Costs (₹)</Label>
                    <Input type="number" value={formData.other_variable_costs || 0} onChange={(e) => setFormData({...formData, other_variable_costs: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCostCalculator;
