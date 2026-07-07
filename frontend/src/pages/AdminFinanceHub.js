import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Receipt, Calculator } from 'lucide-react';
import AdminPayments from '@/pages/AdminPayments';
import AdminExpenses from '@/pages/AdminExpenses';
import AdminCostCalculator from '@/pages/AdminCostCalculator';

const AdminFinanceHub = () => {
  return (
    <Tabs defaultValue="payments" className="space-y-4" data-testid="finance-hub">
      <TabsList>
        <TabsTrigger value="payments" data-testid="payments-tab"><CreditCard className="w-4 h-4 mr-2" />Payments</TabsTrigger>
        <TabsTrigger value="expenses" data-testid="expenses-tab"><Receipt className="w-4 h-4 mr-2" />Expenses</TabsTrigger>
        <TabsTrigger value="cost-calculator" data-testid="cost-calculator-tab"><Calculator className="w-4 h-4 mr-2" />Cost Calculator</TabsTrigger>
      </TabsList>
      <TabsContent value="payments"><AdminPayments /></TabsContent>
      <TabsContent value="expenses"><AdminExpenses /></TabsContent>
      <TabsContent value="cost-calculator"><AdminCostCalculator /></TabsContent>
    </Tabs>
  );
};

export default AdminFinanceHub;
