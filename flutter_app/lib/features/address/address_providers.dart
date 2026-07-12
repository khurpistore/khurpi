import 'package:dio/dio.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';

class AddressState {
  final bool isLoading;
  final Map<String, dynamic>? selectedAddress;

  const AddressState({
    this.isLoading = false,
    this.selectedAddress,
  });

  AddressState copyWith({
    bool? isLoading,
    Map<String, dynamic>? selectedAddress,
  }) {
    return AddressState(
      isLoading: isLoading ?? this.isLoading,
      selectedAddress: selectedAddress ?? this.selectedAddress,
    );
  }

  String? get displayAddress {
    final address = selectedAddress;
    if (address == null) return null;

    // Header shows only house/area line — never city, state, country or pincode.
    final parts = <String>[];
    final line1 = (address['address_line_1'] ?? address['addressLine1'])?.toString();
    final line2 = (address['address_line_2'] ?? address['addressLine2'])?.toString();
    final area = address['area']?.toString();

    if (line1 != null && line1.trim().isNotEmpty) parts.add(line1.trim());
    if (line2 != null && line2.trim().isNotEmpty) parts.add(line2.trim());
    if (area != null && area.trim().isNotEmpty) parts.add(area.trim());

    if (parts.isEmpty) {
      // Fallback: use only the first segment of the joined line (before city etc.)
      final addressLine = (address['address_line'] ?? address['addressLine'])?.toString();
      if (addressLine != null && addressLine.trim().isNotEmpty) {
        return addressLine.split(',').first.trim();
      }
      return null;
    }
    return parts.join(', ');
  }
}

class AddressNotifier extends StateNotifier<AddressState> {
  AddressNotifier() : super(const AddressState());

  final Dio _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));

  Future<void> loadDefaultAddress(String userId) async {
    if (userId.trim().isEmpty) return;

    state = state.copyWith(isLoading: true);

    try {
      final response = await _dio.get('/users/$userId/addresses');
      final addresses = List<Map<String, dynamic>>.from(response.data as List);

      if (addresses.isEmpty) {
        state = state.copyWith(isLoading: false, selectedAddress: null);
        return;
      }

      final defaultAddress = addresses.firstWhere(
        (address) => address['is_default'] == true,
        orElse: () => addresses.first,
      );

      state = state.copyWith(
        isLoading: false,
        selectedAddress: defaultAddress,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  void setSelectedAddress(Map<String, dynamic> address) {
    state = state.copyWith(selectedAddress: address);
  }

  void clear() {
    state = const AddressState();
  }
}

final addressNotifierProvider =
    StateNotifierProvider<AddressNotifier, AddressState>(
  (ref) => AddressNotifier(),
);

