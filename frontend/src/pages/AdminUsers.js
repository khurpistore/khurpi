import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Pencil, Trash2, KeyRound, Truck, Plus, BadgePercent } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResetPasswordDialog = ({ user, open, onOpenChange, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/admin/users/${user.id}/reset-password`, {
        new_password: newPassword
      });
      toast.success(`Password reset for ${user.name}`);
      onOpenChange(false);
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Reset Password for {user?.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              data-testid="admin-reset-password-input"
              type="password"
              placeholder="Enter new password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              data-testid="admin-reset-confirm-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button
            data-testid="admin-reset-password-submit"
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 rounded-full"
            disabled={loading || newPassword.length < 6}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UserDialog = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || 'customer'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/admin/users/${user.id}`, formData);
      toast.success('User updated successfully');
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
        <Label htmlFor="name" className="text-sm">Name</Label>
        <Input
          id="name"
          data-testid="user-name-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="phone" className="text-sm">Phone</Label>
        <Input
          id="phone"
          data-testid="user-phone-input"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="address" className="text-sm">Address</Label>
        <Textarea
          id="address"
          data-testid="user-address-input"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="role" className="text-sm">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger data-testid="user-role-select" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        data-testid="save-user-button"
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 rounded-full"
      >
        {loading ? 'Saving...' : 'Update User'}
      </Button>
    </form>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState(null);
  const [showAddDeliveryBoy, setShowAddDeliveryBoy] = useState(false);
  const [newDeliveryBoy, setNewDeliveryBoy] = useState({ name: '', phone: '', password: '' });
  const [addingDeliveryBoy, setAddingDeliveryBoy] = useState(false);
  const [wholesaleStatus, setWholesaleStatus] = useState({});
  const [wholesaleLoading, setWholesaleLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
      setFilteredUsers(response.data);
      
      // Fetch wholesale status for all customers
      const wholesaleStatusMap = {};
      for (const user of response.data) {
        if (user.role === 'customer') {
          wholesaleStatusMap[user.id] = user.wholesale_enabled || false;
        }
      }
      setWholesaleStatus(wholesaleStatusMap);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleWholesaleToggle = async (userId, enabled) => {
    setWholesaleLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.put(`${API}/admin/users/${userId}/wholesale-access`, {
        wholesale_enabled: enabled
      });
      setWholesaleStatus(prev => ({ ...prev, [userId]: enabled }));
      toast.success(enabled ? 'Wholesale access enabled' : 'Wholesale access disabled');
    } catch (error) {
      toast.error('Failed to update wholesale access');
    } finally {
      setWholesaleLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm) ||
        u.id.includes(searchTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Sort by created_at descending (recent first)
    filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const openDialog = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleAddDeliveryBoy = async (e) => {
    e.preventDefault();
    if (!newDeliveryBoy.name || !newDeliveryBoy.phone || !newDeliveryBoy.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (newDeliveryBoy.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (newDeliveryBoy.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setAddingDeliveryBoy(true);
    try {
      await axios.post(`${API}/admin/delivery-boys`, newDeliveryBoy);
      toast.success('Delivery boy added successfully');
      setNewDeliveryBoy({ name: '', phone: '', password: '' });
      setShowAddDeliveryBoy(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add delivery boy');
    } finally {
      setAddingDeliveryBoy(false);
    }
  };

  // Separate delivery boys from other users
  const deliveryBoys = users.filter(u => u.role === 'delivery_boy');
  const regularUsers = filteredUsers.filter(u => u.role !== 'delivery_boy');

  return (
    <AdminLayout active="users" title="User Management">
      {/* Delivery Boys Section */}
      <Card className="mb-6 border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Delivery Partners</h3>
              <Badge className="bg-blue-100 text-blue-800">{deliveryBoys.length}</Badge>
            </div>
            <Dialog open={showAddDeliveryBoy} onOpenChange={setShowAddDeliveryBoy}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Delivery Partner</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddDeliveryBoy} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      placeholder="Full name"
                      value={newDeliveryBoy.name}
                      onChange={(e) => setNewDeliveryBoy({...newDeliveryBoy, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      placeholder="10-digit phone"
                      value={newDeliveryBoy.phone}
                      onChange={(e) => setNewDeliveryBoy({...newDeliveryBoy, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Min 6 characters"
                      value={newDeliveryBoy.password}
                      onChange={(e) => setNewDeliveryBoy({...newDeliveryBoy, password: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={addingDeliveryBoy}>
                    {addingDeliveryBoy ? 'Adding...' : 'Add Delivery Partner'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {deliveryBoys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No delivery partners yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deliveryBoys.map((db) => (
                <div key={db.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{db.name}</p>
                    <p className="text-sm text-muted-foreground">{db.phone}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setUserToResetPassword(db);
                        setResetPasswordDialogOpen(true);
                      }}
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Delivery Partner?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {db.name} from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(db.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Login URL: <code className="bg-blue-100 px-1 rounded">/delivery/login</code>
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            data-testid="search-users-input"
            placeholder="Search by name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger data-testid="role-filter-select" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary - Mobile Friendly */}
      <div className="mb-6 p-3 sm:p-4 bg-white rounded-lg border border-border">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-lg sm:text-2xl font-bold text-primary">{regularUsers.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'customer').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Customers</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Admins</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading users...</p>
      ) : regularUsers.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2" data-testid="admin-users-list">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-14 gap-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Address</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2 text-center text-orange-600">Wholesale</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          
          {regularUsers.map((u) => (
            <Card key={u.id} data-testid={`admin-user-row-${u.id}`} className="hover:bg-gray-50">
              <CardContent className="p-3 sm:p-4">
                {/* Desktop List View */}
                <div className="hidden md:grid md:grid-cols-14 gap-4 items-center">
                  <div className="col-span-3 flex items-center gap-2">
                    <div>
                      <p className="font-medium text-primary">{u.name}</p>
                      <Badge className={`text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm">{u.phone}</div>
                  <div className="col-span-2 text-sm text-muted-foreground truncate">{u.address || '-'}</div>
                  <div className="col-span-2 text-sm text-muted-foreground">{format(new Date(u.created_at), 'PP')}</div>
                  <div className="col-span-2 flex justify-center">
                    {u.role === 'customer' && (
                      <div className="flex items-center gap-2">
                        <Switch
                          data-testid={`wholesale-toggle-${u.id}`}
                          checked={wholesaleStatus[u.id] || false}
                          disabled={wholesaleLoading[u.id]}
                          onCheckedChange={(checked) => handleWholesaleToggle(u.id, checked)}
                          className={wholesaleStatus[u.id] ? 'data-[state=checked]:bg-orange-500' : ''}
                        />
                        {wholesaleStatus[u.id] && (
                          <BadgePercent className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-3 flex justify-end gap-1">
                    <Dialog open={dialogOpen && selectedUser?.id === u.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => openDialog(u)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <UserDialog user={selectedUser} onClose={() => setDialogOpen(false)} onSuccess={fetchUsers} />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ghost" onClick={() => { setUserToResetPassword(u); setResetPasswordDialogOpen(true); }}>
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete {u.name}.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(u.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-primary">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.phone}</p>
                    </div>
                    <Badge className={`text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Joined {format(new Date(u.created_at), 'PP')}</p>
                  
                  {/* Wholesale Toggle for Mobile */}
                  {u.role === 'customer' && (
                    <div className="flex items-center justify-between mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2">
                        <BadgePercent className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">Wholesale Access</span>
                      </div>
                      <Switch
                        data-testid={`wholesale-toggle-mobile-${u.id}`}
                        checked={wholesaleStatus[u.id] || false}
                        disabled={wholesaleLoading[u.id]}
                        onCheckedChange={(checked) => handleWholesaleToggle(u.id, checked)}
                        className={wholesaleStatus[u.id] ? 'data-[state=checked]:bg-orange-500' : ''}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openDialog(u)}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setUserToResetPassword(u); setResetPasswordDialogOpen(true); }}>
                      <KeyRound className="w-3 h-3 mr-1" /> Reset
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive text-xs">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete {u.name}.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(u.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Reset Password Dialog */}
      {userToResetPassword && (
        <ResetPasswordDialog
          user={userToResetPassword}
          open={resetPasswordDialogOpen}
          onOpenChange={setResetPasswordDialogOpen}
          onSuccess={fetchUsers}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
