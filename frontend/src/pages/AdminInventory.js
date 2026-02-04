import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isTomorrow, isPast } from 'date-fns';
import { 
  Sprout, Calendar, Package, TrendingUp, AlertTriangle, 
  ChevronLeft, ChevronRight, Leaf, Clock, BarChart3
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [growingSchedule, setGrowingSchedule] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [inventoryRes, scheduleRes, deliveriesRes] = await Promise.all([
        axios.get(`${API}/admin/inventory`),
        axios.get(`${API}/admin/inventory/growing-schedule`),
        axios.get(`${API}/admin/inventory/upcoming-deliveries`)
      ]);
      setInventory(inventoryRes.data);
      setGrowingSchedule(scheduleRes.data || []);
      setUpcomingDeliveries(deliveriesRes.data || []);
    } catch (error) {
      // Fallback to just inventory if new endpoints don't exist
      try {
        const inventoryRes = await axios.get(`${API}/admin/inventory`);
        setInventory(inventoryRes.data);
        // Generate schedule from inventory data
        generateScheduleFromInventory(inventoryRes.data);
      } catch (err) {
        toast.error('Failed to load inventory data');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateScheduleFromInventory = (inventoryData) => {
    // Generate a 14-day growing schedule based on inventory data
    const schedule = [];
    const today = new Date();
    
    inventoryData.forEach(item => {
      const growthDays = item.growth_days || 7;
      // Calculate daily requirement based on total demand
      const dailyQty = Math.ceil(item.total_trays / 7);
      
      for (let i = 0; i < 14; i++) {
        const plantDate = addDays(today, i);
        const harvestDate = addDays(plantDate, growthDays);
        
        schedule.push({
          product_name: item.name,
          product_id: item.product_id,
          growth_days: growthDays,
          plant_date: format(plantDate, 'yyyy-MM-dd'),
          harvest_date: format(harvestDate, 'yyyy-MM-dd'),
          quantity_grams: dailyQty * 100, // Convert packs to grams
          quantity_packs: dailyQty
        });
      }
    });
    
    setGrowingSchedule(schedule);
  };

  // Get current week's dates
  const getWeekDates = () => {
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  // Group schedule by date
  const getScheduleForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return growingSchedule.filter(item => item.plant_date === dateStr);
  };

  // Get today's planting requirements
  const getTodayPlanting = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return growingSchedule.filter(item => item.plant_date === todayStr);
  };

  // Get upcoming harvests
  const getUpcomingHarvests = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return growingSchedule.filter(item => {
      const harvestDate = new Date(item.harvest_date);
      return harvestDate >= today && harvestDate <= nextWeek;
    }).sort((a, b) => new Date(a.harvest_date) - new Date(b.harvest_date));
  };

  const weekDates = getWeekDates();
  const todayPlanting = getTodayPlanting();
  const upcomingHarvests = getUpcomingHarvests();

  // Calculate totals for summary
  const totalDailyGrams = todayPlanting.reduce((sum, item) => sum + (item.quantity_grams || 0), 0);
  const totalWeeklyPacks = inventory.reduce((sum, item) => sum + item.total_trays, 0);

  return (
    <AdminLayout active="inventory" title="Inventory & Growing Planner">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Sprout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Plant Today</p>
                    <p className="text-xl font-bold text-green-800">{totalDailyGrams}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Weekly Demand</p>
                    <p className="text-xl font-bold text-blue-800">{totalWeeklyPacks} packs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-700">Varieties</p>
                    <p className="text-xl font-bold text-amber-800">{inventory.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Harvests This Week</p>
                    <p className="text-xl font-bold text-purple-800">{upcomingHarvests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Planting Requirements - Priority Section */}
          <Card className="border-2 border-green-300 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Sprout className="w-5 h-5" />
                Today's Planting Requirements
                <Badge className="bg-green-600 ml-2">{format(new Date(), 'EEE, MMM d')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayPlanting.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No planting scheduled for today</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="today-planting-table">
                    <thead>
                      <tr className="border-b border-green-200">
                        <th className="text-left py-2 px-3 text-sm font-semibold text-green-800">Microgreen</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-green-800">Quantity (g)</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-green-800">Packs</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-green-800">Growth Days</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-green-800">Harvest Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayPlanting.map((item, idx) => (
                        <tr key={idx} className="border-b border-green-100 hover:bg-green-100/50">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <Leaf className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{item.product_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-green-700">{item.quantity_grams}g</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant="outline" className="border-green-300">{item.quantity_packs}</Badge>
                          </td>
                          <td className="py-3 px-3 text-center text-muted-foreground">
                            {item.growth_days} days
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                              {format(new Date(item.harvest_date), 'EEE, MMM d')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-green-100">
                        <td className="py-3 px-3 font-bold text-green-800">TOTAL</td>
                        <td className="py-3 px-3 text-center font-bold text-green-800">{totalDailyGrams}g</td>
                        <td className="py-3 px-3 text-center font-bold text-green-800">
                          {todayPlanting.reduce((sum, item) => sum + item.quantity_packs, 0)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Growing Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Weekly Growing Schedule
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setWeekOffset(prev => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setWeekOffset(0)}
                    disabled={weekOffset === 0}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setWeekOffset(prev => prev + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]" data-testid="weekly-schedule-table">
                  <thead>
                    <tr>
                      {weekDates.map((date, idx) => (
                        <th 
                          key={idx} 
                          className={`text-center p-2 border-b ${
                            isToday(date) 
                              ? 'bg-green-100 border-green-300' 
                              : isTomorrow(date) 
                                ? 'bg-blue-50' 
                                : isPast(date) 
                                  ? 'bg-gray-50 text-gray-400' 
                                  : ''
                          }`}
                        >
                          <div className="text-xs font-medium text-muted-foreground">
                            {format(date, 'EEE')}
                          </div>
                          <div className={`text-sm font-bold ${isToday(date) ? 'text-green-700' : ''}`}>
                            {format(date, 'MMM d')}
                          </div>
                          {isToday(date) && (
                            <Badge className="bg-green-600 text-xs mt-1">Today</Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((product) => (
                      <tr key={product.product_id} className="border-b">
                        {weekDates.map((date, idx) => {
                          const schedule = getScheduleForDate(date).filter(s => s.product_id === product.product_id);
                          const totalQty = schedule.reduce((sum, s) => sum + (s.quantity_grams || 0), 0);
                          return (
                            <td 
                              key={idx} 
                              className={`p-2 text-center border-r ${
                                isToday(date) ? 'bg-green-50' : isPast(date) ? 'bg-gray-50' : ''
                              }`}
                            >
                              {totalQty > 0 ? (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">{product.name}</div>
                                  <Badge 
                                    className={`${
                                      isToday(date) 
                                        ? 'bg-green-600' 
                                        : isPast(date) 
                                          ? 'bg-gray-400' 
                                          : 'bg-primary'
                                    }`}
                                  >
                                    {totalQty}g
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Daily Totals Row */}
                    <tr className="bg-gray-50 font-bold">
                      {weekDates.map((date, idx) => {
                        const daySchedule = getScheduleForDate(date);
                        const dayTotal = daySchedule.reduce((sum, s) => sum + (s.quantity_grams || 0), 0);
                        return (
                          <td 
                            key={idx} 
                            className={`p-2 text-center ${isToday(date) ? 'bg-green-100' : ''}`}
                          >
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className={`font-bold ${isToday(date) ? 'text-green-700' : 'text-gray-700'}`}>
                              {dayTotal}g
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Harvests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Upcoming Harvests (Next 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingHarvests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No harvests scheduled</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="upcoming-harvests-table">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-semibold">Harvest Date</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Microgreen</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold">Quantity</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingHarvests.slice(0, 10).map((item, idx) => {
                        const harvestDate = new Date(item.harvest_date);
                        const isHarvestToday = isToday(harvestDate);
                        const isHarvestTomorrow = isTomorrow(harvestDate);
                        return (
                          <tr key={idx} className={`border-b hover:bg-gray-50 ${isHarvestToday ? 'bg-amber-50' : ''}`}>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className={isHarvestToday ? 'font-bold text-amber-700' : ''}>
                                  {format(harvestDate, 'EEE, MMM d')}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-medium">{item.product_name}</td>
                            <td className="py-3 px-3 text-center">
                              <Badge variant="outline">{item.quantity_grams}g</Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isHarvestToday ? (
                                <Badge className="bg-amber-500">Harvest Today!</Badge>
                              ) : isHarvestTomorrow ? (
                                <Badge className="bg-blue-500">Tomorrow</Badge>
                              ) : (
                                <Badge variant="secondary">Scheduled</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Demand Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Product Demand Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active subscriptions</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="demand-summary-table">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-3 text-sm font-semibold">Microgreen</th>
                        <th className="text-center py-3 px-3 text-sm font-semibold">Growth Days</th>
                        <th className="text-center py-3 px-3 text-sm font-semibold">Weekly Subs</th>
                        <th className="text-center py-3 px-3 text-sm font-semibold">Bi-Weekly Subs</th>
                        <th className="text-center py-3 px-3 text-sm font-semibold">Monthly Subs</th>
                        <th className="text-center py-3 px-3 text-sm font-semibold">Daily Grow (g)</th>
                        <th className="text-center py-3 px-3 text-sm font-semibold">Total Weekly</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => {
                        const dailyGrow = Math.ceil((item.total_trays * 100) / 7);
                        return (
                          <tr key={item.product_id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge variant="outline">{item.growth_days} days</Badge>
                            </td>
                            <td className="py-3 px-3 text-center">{item.weekly_demand || 0}</td>
                            <td className="py-3 px-3 text-center">{item.bi_weekly_demand || 0}</td>
                            <td className="py-3 px-3 text-center">{item.monthly_demand || 0}</td>
                            <td className="py-3 px-3 text-center">
                              <Badge className="bg-green-600">{dailyGrow}g</Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-bold text-primary">{item.total_trays * 100}g</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-primary/5 font-bold">
                        <td className="py-3 px-3">TOTAL</td>
                        <td className="py-3 px-3"></td>
                        <td className="py-3 px-3 text-center">
                          {inventory.reduce((sum, i) => sum + (i.weekly_demand || 0), 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {inventory.reduce((sum, i) => sum + (i.bi_weekly_demand || 0), 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {inventory.reduce((sum, i) => sum + (i.monthly_demand || 0), 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge className="bg-green-700">
                            {Math.ceil(inventory.reduce((sum, i) => sum + i.total_trays, 0) * 100 / 7)}g
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-primary">
                          {inventory.reduce((sum, i) => sum + i.total_trays, 0) * 100}g
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInventory;
