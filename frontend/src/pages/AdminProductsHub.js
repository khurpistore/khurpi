import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FolderTree, Layers } from 'lucide-react';
import AdminProducts from '@/pages/AdminProducts';
import AdminCategories from '@/pages/AdminCategories';
import AdminSubcategories from '@/pages/AdminSubcategories';

const AdminProductsHub = () => {
  return (
    <Tabs defaultValue="products" className="space-y-4" data-testid="products-hub">
      <TabsList>
        <TabsTrigger value="products" data-testid="products-tab"><Package className="w-4 h-4 mr-2" />Products</TabsTrigger>
        <TabsTrigger value="categories" data-testid="categories-tab"><FolderTree className="w-4 h-4 mr-2" />Categories</TabsTrigger>
        <TabsTrigger value="subcategories" data-testid="subcategories-tab"><Layers className="w-4 h-4 mr-2" />Subcategories</TabsTrigger>
      </TabsList>
      <TabsContent value="products"><AdminProducts /></TabsContent>
      <TabsContent value="categories"><AdminCategories /></TabsContent>
      <TabsContent value="subcategories"><AdminSubcategories /></TabsContent>
    </Tabs>
  );
};

export default AdminProductsHub;
