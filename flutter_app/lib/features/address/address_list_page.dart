import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/address/address_form_page.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';

class AddressListPage extends ConsumerStatefulWidget {
  final bool isSelecting;
  final String? selectedAddressId;

  const AddressListPage({
    super.key,
    this.isSelecting = false,
    this.selectedAddressId,
  });

  @override
  ConsumerState<AddressListPage> createState() => _AddressListPageState();
}

class _AddressListPageState extends ConsumerState<AddressListPage> {
  final _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
  List<Map<String, dynamic>> _addresses = [];
  bool _isLoading = true;
  String? _selectedId;

  @override
  void initState() {
    super.initState();
    _selectedId = widget.selectedAddressId;
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadAddresses());
  }

  Future<void> _loadAddresses() async {
    final user = ref.read(provideAuthViewModelProvider)?.user;
    if (user == null) return;

    setState(() => _isLoading = true);

    try {
      final response = await _dio.get('/users/${user.userId}/addresses');
      setState(() {
        _addresses = List<Map<String, dynamic>>.from(response.data);
        // If no address is selected, select the default one
        if (_selectedId == null && _addresses.isNotEmpty) {
          final defaultAddr = _addresses.firstWhere(
            (a) => a['is_default'] == true,
            orElse: () => _addresses.first,
          );
          _selectedId = defaultAddr['id'];
        }
      });
    } catch (e) {
      debugPrint('Error loading addresses: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteAddress(String addressId) async {
    final user = ref.read(provideAuthViewModelProvider)?.user;
    if (user == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Address'),
        content: const Text('Are you sure you want to delete this address?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await _dio.delete('/users/${user.userId}/addresses/$addressId');
      
      // If deleted address was selected, reset selection
      if (_selectedId == addressId) {
        _selectedId = null;
      }
      
      await _loadAddresses();
      
      // After reload, if selectedId is still null, select default address
      if (_selectedId == null && _addresses.isNotEmpty) {
        final defaultAddr = _addresses.firstWhere(
          (a) => a['is_default'] == true,
          orElse: () => _addresses.first,
        );
        setState(() => _selectedId = defaultAddr['id']);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Address deleted')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _setDefaultAddress(String addressId) async {
    final user = ref.read(provideAuthViewModelProvider)?.user;
    if (user == null) return;

    try {
      await _dio.put('/users/${user.userId}/addresses/$addressId/set-default');
      _loadAddresses();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Default address updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _addNewAddress() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const AddAddressPage(),
      ),
    );
    if (result == true) {
      _loadAddresses();
    }
  }

  void _editAddress(Map<String, dynamic> address) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddAddressPage(address: address),
      ),
    );
    if (result == true) {
      _loadAddresses();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.isSelecting ? 'Select Address' : 'My Addresses'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        // Removed add button from action bar - it's at bottom now
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _addresses.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadAddresses,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _addresses.length,
                    itemBuilder: (context, index) {
                      final address = _addresses[index];
                      final isDefault = address['is_default'] == true;
                      final isSelected = _selectedId == address['id'];

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: widget.isSelecting && isSelected
                              ? Border.all(color: AppColors.primary, width: 2)
                              : null,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: widget.isSelecting
                              ? () {
                                  setState(() => _selectedId = address['id']);
                                  Navigator.pop(context, address);
                                }
                              : null,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        address['address_type']
                                                ?.toString()
                                                .toUpperCase() ??
                                            'HOME',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    ),
                                    if (isDefault) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: AppColors.success.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          'DEFAULT',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.success,
                                          ),
                                        ),
                                      ),
                                    ],
                                    const Spacer(),
                                    if (!widget.isSelecting) ...[
                                      IconButton(
                                        icon: Icon(Icons.edit_outlined,
                                            size: 20, color: AppColors.primary),
                                        onPressed: () => _editAddress(address),
                                        constraints: const BoxConstraints(),
                                        padding: const EdgeInsets.all(8),
                                      ),
                                      IconButton(
                                        icon: Icon(Icons.delete_outline,
                                            size: 20, color: AppColors.error),
                                        onPressed: () =>
                                            _deleteAddress(address['id']),
                                        constraints: const BoxConstraints(),
                                        padding: const EdgeInsets.all(8),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 12),
                                if (address['name'] != null)
                                  Text(
                                    address['name'],
                                    style: AppTextStyles.body.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                const SizedBox(height: 4),
                                Text(
                                  _formatAddress(address),
                                  style: AppTextStyles.body.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (address['phone'] != null) ...[
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(Icons.phone_outlined,
                                          size: 16, color: AppColors.textHint),
                                      const SizedBox(width: 4),
                                      Text(
                                        address['phone'],
                                        style: AppTextStyles.bodySmall.copyWith(
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                                if (!isDefault && !widget.isSelecting) ...[
                                  const SizedBox(height: 12),
                                  TextButton(
                                    onPressed: () =>
                                        _setDefaultAddress(address['id']),
                                    child: const Text('Set as Default'),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addNewAddress,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  String _formatAddress(Map<String, dynamic> address) {
    final parts = <String>[];
    final line1 = address['address_line_1'] ?? address['address_line'];
    if (line1 != null && line1.toString().isNotEmpty) parts.add(line1.toString());
    if (address['address_line_2'] != null && address['address_line_2'].toString().isNotEmpty) {
      parts.add(address['address_line_2'].toString());
    }
    if (address['area'] != null && address['area'].toString().isNotEmpty) {
      parts.add(address['area'].toString());
    }
    if (address['landmark'] != null && address['landmark'].toString().isNotEmpty) {
      parts.add('Near ${address['landmark']}');
    }
    final cityState = <String>[];
    if (address['city'] != null && address['city'].toString().isNotEmpty) cityState.add(address['city'].toString());
    if (address['state'] != null && address['state'].toString().isNotEmpty) cityState.add(address['state'].toString());
    if (cityState.isNotEmpty) parts.add(cityState.join(', '));
    final pincode = address['pincode'];
    if (pincode != null && pincode.toString().isNotEmpty) {
      parts.add(pincode.toString());
    }
    return parts.join(', ');
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.location_off_outlined,
            size: 80,
            color: AppColors.textHint.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text('No addresses saved', style: AppTextStyles.h4),
          const SizedBox(height: 8),
          Text(
            'Add your delivery addresses here',
            style: AppTextStyles.body.copyWith(color: AppColors.textHint),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _addNewAddress,
            icon: const Icon(Icons.add),
            label: const Text('Add Address'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class AddAddressPage extends ConsumerStatefulWidget {
  final Map<String, dynamic>? address;

  const AddAddressPage({super.key, this.address});

  @override
  ConsumerState<AddAddressPage> createState() => _AddAddressPageState();
}

class _AddAddressPageState extends ConsumerState<AddAddressPage> {
  final _formKey = GlobalKey<FormState>();
  final _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));

  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _addressLine1Controller;
  late final TextEditingController _addressLine2Controller;
  late final TextEditingController _landmarkController;
  late final TextEditingController _areaController;
  late final TextEditingController _cityController;
  late final TextEditingController _stateController;
  late final TextEditingController _pincodeController;

  String _addressType = 'home';
  bool _isDefault = false;
  bool _isSaving = false;

  bool get _isEditing => widget.address != null;

  @override
  void initState() {
    super.initState();
    final addr = widget.address;
    _nameController = TextEditingController(text: addr?['name']);
    _phoneController = TextEditingController(text: addr?['phone']);
    _addressLine1Controller = TextEditingController(
        text: addr?['address_line_1'] ?? addr?['address_line']);
    _addressLine2Controller =
        TextEditingController(text: addr?['address_line_2']);
    _landmarkController = TextEditingController(text: addr?['landmark']);
    _areaController = TextEditingController(text: addr?['area']);
    _cityController = TextEditingController(text: addr?['city']);
    _stateController = TextEditingController(text: addr?['state']);
    _pincodeController = TextEditingController(text: addr?['pincode']);
    _addressType = addr?['address_type'] ?? 'home';
    _isDefault = addr?['is_default'] ?? false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _landmarkController.dispose();
    _areaController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    final user = ref.read(provideAuthViewModelProvider)?.user;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login first')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final addressLine = [
      _addressLine1Controller.text.trim(),
      if (_addressLine2Controller.text.trim().isNotEmpty)
        _addressLine2Controller.text.trim(),
      if (_landmarkController.text.trim().isNotEmpty)
        'Near ${_landmarkController.text.trim()}',
      _cityController.text.trim(),
      _stateController.text.trim(),
      _pincodeController.text.trim(),
    ].join(', ');

    final data = {
      'name': _nameController.text.trim(),
      'phone': _phoneController.text.trim(),
      'address_line': addressLine,
      'address_line_1': _addressLine1Controller.text.trim(),
      'address_line_2': _addressLine2Controller.text.trim(),
      'landmark': _landmarkController.text.trim(),
      'area': _areaController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _stateController.text.trim(),
      'pincode': _pincodeController.text.trim(),
      'address_type': _addressType,
      'is_default': _isDefault,
    };

    try {
      if (_isEditing) {
        await _dio.put(
          '/users/${user.userId}/addresses/${widget.address!['id']}',
          data: data,
        );
      } else {
        await _dio.post('/users/${user.userId}/addresses', data: data);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text(_isEditing ? 'Address updated!' : 'Address added!'),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Address' : 'Add Address'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Address Type Selection
              Row(
                children: [
                  _buildTypeChip('home', Icons.home),
                  const SizedBox(width: 12),
                  _buildTypeChip('work', Icons.work),
                  const SizedBox(width: 12),
                  _buildTypeChip('other', Icons.location_on),
                ],
              ),
              const SizedBox(height: 20),

              // Name & Phone
              TextFormField(
                controller: _nameController,
                decoration: _inputDecoration('Full Name', Icons.person_outline),
                textCapitalization: TextCapitalization.words,
                validator: (v) =>
                    v?.trim().isEmpty == true ? 'Name is required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration:
                    _inputDecoration('Phone Number', Icons.phone_outlined),
                keyboardType: TextInputType.phone,
                validator: (v) => v?.trim().isEmpty == true
                    ? 'Phone number is required'
                    : null,
              ),
              const SizedBox(height: 20),

              // Address Fields
              TextFormField(
                controller: _addressLine1Controller,
                decoration: _inputDecoration(
                    'House No, Building, Street', Icons.home_outlined),
                textCapitalization: TextCapitalization.words,
                validator: (v) =>
                    v?.trim().isEmpty == true ? 'Address is required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressLine2Controller,
                decoration:
                    _inputDecoration('Area, Colony (Optional)', Icons.apartment),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _landmarkController,
                decoration:
                    _inputDecoration('Landmark (Optional)', Icons.place_outlined),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _cityController,
                      decoration: _inputDecoration('City', Icons.location_city),
                      textCapitalization: TextCapitalization.words,
                      validator: (v) =>
                          v?.trim().isEmpty == true ? 'City is required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _pincodeController,
                      decoration: _inputDecoration('Pincode', Icons.pin),
                      keyboardType: TextInputType.number,
                      validator: (v) => v?.trim().isEmpty == true
                          ? 'Pincode is required'
                          : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _stateController,
                decoration: _inputDecoration('State', Icons.map_outlined),
                textCapitalization: TextCapitalization.words,
                validator: (v) =>
                    v?.trim().isEmpty == true ? 'State is required' : null,
              ),
              const SizedBox(height: 20),

              // Default Address Toggle
              SwitchListTile(
                title: const Text('Set as default address'),
                subtitle: const Text('This will be used for all orders'),
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v),
                activeColor: AppColors.primary,
              ),
              const SizedBox(height: 24),

              // Save Button
              ElevatedButton(
                onPressed: _isSaving ? null : _saveAddress,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(
                        _isEditing ? 'Update Address' : 'Save Address',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeChip(String type, IconData icon) {
    final isSelected = _addressType == type;
    return GestureDetector(
      onTap: () => setState(() => _addressType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : AppColors.textSecondary,
            ),
            const SizedBox(width: 6),
            Text(
              type.toUpperCase(),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      filled: true,
      fillColor: AppColors.surface,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.textHint.withOpacity(0.35)),
      ),
    );
  }
}
