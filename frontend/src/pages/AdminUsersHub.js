import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserSearch } from 'lucide-react';
import AdminUsers from '@/pages/AdminUsers';
import AdminCustomerView from '@/pages/AdminCustomerView';

const AdminUsersHub = () => {
  return (
    <Tabs defaultValue="users" className="space-y-4" data-testid="users-hub">
      <TabsList>
        <TabsTrigger value="users" data-testid="users-tab"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
        <TabsTrigger value="customer-view" data-testid="customer-view-tab"><UserSearch className="w-4 h-4 mr-2" />Customer View</TabsTrigger>
      </TabsList>
      <TabsContent value="users"><AdminUsers /></TabsContent>
      <TabsContent value="customer-view"><AdminCustomerView /></TabsContent>
    </Tabs>
  );
};

export default AdminUsersHub;
