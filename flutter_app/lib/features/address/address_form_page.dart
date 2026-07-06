import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';

class AddressFormPage extends ConsumerStatefulWidget {
  const AddressFormPage({super.key});

  @override
  ConsumerState<AddressFormPage> createState() => _AddressFormPageState();
}

class _AddressFormPageState extends ConsumerState<AddressFormPage> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _addressLine1Controller;
  late final TextEditingController _addressLine2Controller;
  late final TextEditingController _landmarkController;
  late final TextEditingController _cityController;
  late final TextEditingController _stateController;
  late final TextEditingController _countryController;
  late final TextEditingController _pincodeController;

  double? _latitude;
  double? _longitude;
  bool _isLocating = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(provideAuthViewModelProvider)?.user;
    _addressLine1Controller = TextEditingController(text: user?.addressLine1 ?? user?.address ?? '');
    _addressLine2Controller = TextEditingController(text: user?.addressLine2 ?? '');
    _landmarkController = TextEditingController(text: user?.landmark ?? '');
    _cityController = TextEditingController(text: user?.city ?? '');
    _stateController = TextEditingController(text: user?.state ?? '');
    _countryController = TextEditingController(text: user?.country ?? 'India');
    _pincodeController = TextEditingController(text: user?.pincode ?? '');
    _latitude = user?.latitude;
    _longitude = user?.longitude;
  }

  @override
  void dispose() {
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _landmarkController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _countryController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Address'),
        backgroundColor: AppColors.surface,
      ),
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Form(
          key: _formKey,
           child: ListView(
             padding: const EdgeInsets.all(16),
             children: [
              TextFormField(
                controller: _addressLine1Controller,
                decoration: _inputDecoration('Address Line 1', Icons.home_outlined),
                textCapitalization: TextCapitalization.words,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Address line 1 is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressLine2Controller,
                decoration: _inputDecoration('Address Line 2 (optional)', Icons.apartment_outlined),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _landmarkController,
                decoration: _inputDecoration('Landmark (optional)', Icons.place_outlined),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 12),
              _buildReadOnlyField('City', _cityController, Icons.location_city_outlined),
              const SizedBox(height: 12),
              _buildReadOnlyField('State', _stateController, Icons.map_outlined),
              const SizedBox(height: 12),
              _buildReadOnlyField('Country', _countryController, Icons.public),
              const SizedBox(height: 12),
              _buildReadOnlyField('Pincode', _pincodeController, Icons.pin_drop_outlined),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isSaving ? null : _saveAddress,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                      )
                    : const Text('Save Address', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
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
        borderSide: BorderSide(color: AppColors.textHint.withValues(alpha: 0.35)),
      ),
    );
  }

  Widget _buildReadOnlyField(String label, TextEditingController controller, IconData icon) {
    return TextFormField(
      controller: controller,
      readOnly: false,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        suffixIcon: const Icon(Icons.lock_outline, size: 18),
        filled: true,
        fillColor: AppColors.surface.withValues(alpha: 0.6),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
        ),
      ),
    );
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _isLocating = true);

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _showMessage('Please enable location services.');
        return;
      }

       LocationPermission permission = await Geolocator.checkPermission();
       if (permission == LocationPermission.denied) {
         permission = await Geolocator.requestPermission();
       }

       if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
         _showMessage('Location permission is required to fetch address from current location.');
         return;
       }

       final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      final placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      final place = placemarks.isNotEmpty ? placemarks.first : null;

      if (!mounted) return;
      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
        _addressLine1Controller.text = [place?.street, place?.subLocality]
            .whereType<String>()
            .where((e) => e.trim().isNotEmpty)
            .join(', ');
        _addressLine2Controller.text = [place?.locality, place?.subAdministrativeArea]
            .whereType<String>()
            .where((e) => e.trim().isNotEmpty)
            .join(', ');
        _landmarkController.text = place?.name ?? _landmarkController.text;
        _cityController.text = place?.locality ?? place?.subAdministrativeArea ?? _cityController.text;
        _stateController.text = place?.administrativeArea ?? _stateController.text;
        _countryController.text = place?.country ?? _countryController.text;
        _pincodeController.text = place?.postalCode ?? _pincodeController.text;
      });
    } catch (_) {
      _showMessage('Unable to fetch current location. Please fill manually.');
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    final notifier = ref.read(provideAuthViewModelNotifierProvider);
    if (notifier == null) {
      _showMessage('Unable to save address right now.');
      return;
    }

    setState(() => _isSaving = true);
    await notifier.updateAddress(
      addressLine1: _addressLine1Controller.text.trim(),
      addressLine2: _addressLine2Controller.text.trim(),
      landmark: _landmarkController.text.trim(),
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      country: _countryController.text.trim(),
      pincode: _pincodeController.text.trim(),
      latitude: _latitude,
      longitude: _longitude,
    );

    if (!mounted) return;
    setState(() => _isSaving = false);
    _showMessage('Address saved successfully.');
    Navigator.pop(context, true);
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

