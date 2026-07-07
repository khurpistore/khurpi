import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Clock, Loader2, CalendarX } from 'lucide-react';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDeliverySlots = () => {
  const [slots, setSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  
  const [slotForm, setSlotForm] = useState({
    name: '',
    start_time: '07:00',
    end_time: '10:00',
    max_orders: 50,
    delivery_fee: 0,
    active: true,
    display_order: 0,
    available_days: [],
    cutoff_hours: 2
  });

  const [blockForm, setBlockForm] = useState({
    date: '',
    reason: '',
    block_all_slots: true,
    blocked_slot_ids: []
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, blockedRes] = await Promise.all([
        axios.get(`${API}/admin/delivery-slots`),
        axios.get(`${API}/admin/blocked-dates`)
      ]);
      setSlots(slotsRes.data);
      setBlockedDates(blockedRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSubmit = async () => {
    if (!slotForm.name.trim()) {
      toast.error('Slot name is required');
      return;
    }

    try {
      if (editingSlot) {
        await axios.put(`${API}/admin/delivery-slots/${editingSlot.id}`, slotForm);
        toast.success('Slot updated!');
      } else {
        await axios.post(`${API}/admin/delivery-slots`, slotForm);
        toast.success('Slot created!');
      }
      setShowSlotDialog(false);
      resetSlotForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save slot');
    }
  };

  const handleBlockSubmit = async () => {
    if (!blockForm.date || !blockForm.reason) {
      toast.error('Date and reason are required');
      return;
    }

    try {
      await axios.post(`${API}/admin/blocked-dates`, blockForm);
      toast.success('Date blocked!');
      setShowBlockDialog(false);
      setBlockForm({ date: '', reason: '', block_all_slots: true, blocked_slot_ids: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to block date');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this delivery slot?')) return;
    try {
      await axios.delete(`${API}/admin/delivery-slots/${id}`);
      toast.success('Slot deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete slot');
    }
  };

  const handleDeleteBlockedDate = async (id) => {
    try {
      await axios.delete(`${API}/admin/blocked-dates/${id}`);
      toast.success('Date unblocked!');
      fetchData();
    } catch (error) {
      toast.error('Failed to unblock date');
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      name: slot.name,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_orders: slot.max_orders,
      delivery_fee: slot.delivery_fee || 0,
      active: slot.active,
      display_order: slot.display_order || 0,
      available_days: slot.available_days || [],
      cutoff_hours: slot.cutoff_hours || 2
    });
    setShowSlotDialog(true);
  };

  const resetSlotForm = () => {
    setEditingSlot(null);
    setSlotForm({
      name: '',
      start_time: '07:00',
      end_time: '10:00',
      max_orders: 50,
      delivery_fee: 0,
      active: true,
      display_order: 0,
      available_days: [],
      cutoff_hours: 2
    });
  };

  const toggleDay = (day) => {
    setSlotForm(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout active="delivery-slots" title="">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Delivery Slots</h1>
          <p className="text-muted-foreground">Manage delivery time slots and blocked dates</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarX className="w-4 h-4 mr-2" />
                Block Date
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block a Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={blockForm.date}
                    onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <Input
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                    placeholder="e.g., Diwali Holiday"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={blockForm.block_all_slots}
                    onCheckedChange={(checked) => setBlockForm({ ...blockForm, block_all_slots: checked })}
                  />
                  <Label>Block all slots</Label>
                </div>
                <Button onClick={handleBlockSubmit} className="w-full">Block Date</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSlotDialog} onOpenChange={(open) => { setShowSlotDialog(open); if (!open) resetSlotForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSlot ? 'Edit Slot' : 'Add Delivery Slot'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Slot Name *</Label>
                  <Input
                    value={slotForm.name}
                    onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
                    placeholder="e.g., Morning"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slotForm.start_time}
                      onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slotForm.end_time}
                      onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Orders</Label>
                    <Input
                      type="number"
                      value={slotForm.max_orders}
                      onChange={(e) => setSlotForm({ ...slotForm, max_orders: parseInt(e.target.value) || 50 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Extra Fee (₹)</Label>
                    <Input
                      type="number"
                      value={slotForm.delivery_fee}
                      onChange={(e) => setSlotForm({ ...slotForm, delivery_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={slotForm.display_order}
                      onChange={(e) => setSlotForm({ ...slotForm, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cutoff Hours</Label>
                    <Input
                      type="number"
                      value={slotForm.cutoff_hours}
                      onChange={(e) => setSlotForm({ ...slotForm, cutoff_hours: parseInt(e.target.value) || 2 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Days (empty = all days)</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <Badge
                        key={day}
                        variant={slotForm.available_days.includes(day) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleDay(day)}
                      >
                        {day.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={slotForm.active}
                    onCheckedChange={(checked) => setSlotForm({ ...slotForm, active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                <Button onClick={handleSlotSubmit} className="w-full">
                  {editingSlot ? 'Update Slot' : 'Create Slot'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Delivery Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No delivery slots configured</p>
              <Button variant="link" onClick={() => setShowSlotDialog(true)}>Add your first slot</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {slots.map(slot => (
                <div key={slot.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{slot.name}</span>
                      <Badge variant="outline">{slot.display_text || `${slot.start_time} - ${slot.end_time}`}</Badge>
                      {!slot.active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Max: {slot.max_orders} orders
                      {slot.delivery_fee > 0 && ` • +₹${slot.delivery_fee} fee`}
                      {slot.available_days?.length > 0 && ` • ${slot.available_days.map(d => d.slice(0, 3)).join(', ')}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSlot(slot)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSlot(slot.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="w-5 h-5" />
            Blocked Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockedDates.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No blocked dates</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map(blocked => (
                <div key={blocked.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <span className="font-medium">{format(new Date(blocked.date), 'PPP')}</span>
                    <span className="text-muted-foreground ml-2">- {blocked.reason}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteBlockedDate(blocked.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
};

export default AdminDeliverySlots;
