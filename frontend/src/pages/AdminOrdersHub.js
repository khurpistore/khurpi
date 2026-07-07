import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, PlusCircle } from 'lucide-react';
import AdminOrders from '@/pages/AdminOrders';
import AdminCreateOrder from '@/pages/AdminCreateOrder';

const AdminOrdersHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'create' ? 'create' : 'orders';

  const handleChange = (value) => {
    setSearchParams(value === 'create' ? { tab: 'create' } : {});
  };

  return (
    <Tabs value={tab} onValueChange={handleChange} className="space-y-4" data-testid="orders-hub">
      <TabsList>
        <TabsTrigger value="orders" data-testid="orders-tab"><ShoppingBag className="w-4 h-4 mr-2" />Orders</TabsTrigger>
        <TabsTrigger value="create" data-testid="create-order-tab"><PlusCircle className="w-4 h-4 mr-2" />Create Order</TabsTrigger>
      </TabsList>
      <TabsContent value="orders"><AdminOrders /></TabsContent>
      <TabsContent value="create"><AdminCreateOrder /></TabsContent>
    </Tabs>
  );
};

export default AdminOrdersHub;
