import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/store_settings_model.dart';
import 'package:khurpi_fresh/data/models/delivery_slot_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/store_remote_datasource.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

part 'store_viewmodel.freezed.dart';
part 'store_viewmodel.g.dart';

@freezed
sealed class StoreState with _$StoreState {
  const factory StoreState({
    @Default(false) bool isLoading,
    @Default(false) bool isSlotsLoading,
    StoreSettingsModel? settings,
    @Default([]) List<DeliverySlotModel> deliverySlots,
    @Default('slotted') String deliveryType,
    String? selectedDate,
    String? selectedSlotId,
    String? errorMessage,
  }) = _StoreState;
}

@Riverpod(keepAlive: true)
class StoreViewModel extends _$StoreViewModel {
  StoreRemoteDataSource? _storeRemoteDataSource;

  @override
  StoreState build() {
    final remoteDS = ref.watch(provideStoreRemoteDataSourceProvider);
    
    if (remoteDS != null) {
      _storeRemoteDataSource = remoteDS;
    }
    
    return const StoreState();
  }

  Future<void> loadStoreSettings() async {
    if (_storeRemoteDataSource == null) return;
    
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final settings = await _storeRemoteDataSource!.getStoreSettings();
      
      // Set default delivery type based on settings
      String defaultType = 'slotted';
      if (settings.instantDeliveryEnabled && !settings.slottedDeliveryEnabled) {
        defaultType = 'instant';
      }
      
      state = state.copyWith(
        isLoading: false,
        settings: settings,
        deliveryType: defaultType,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> loadDeliverySlots(String date) async {
    if (_storeRemoteDataSource == null) return;
    
    state = state.copyWith(isSlotsLoading: true, selectedDate: date);

    try {
      final slots = await _storeRemoteDataSource!.getDeliverySlots(date);
      
      // Auto-select first available slot
      String? autoSelectedSlotId;
      for (final slot in slots) {
        if (slot.available) {
          autoSelectedSlotId = slot.id;
          break;
        }
      }
      
      state = state.copyWith(
        isSlotsLoading: false,
        deliverySlots: slots,
        selectedSlotId: autoSelectedSlotId,
      );
    } catch (e) {
      state = state.copyWith(
        isSlotsLoading: false,
        deliverySlots: [],
      );
    }
  }

  void setDeliveryType(String type) {
    state = state.copyWith(deliveryType: type);
  }

  void setSelectedDate(String date) {
    state = state.copyWith(selectedDate: date);
    loadDeliverySlots(date);
  }

  void setSelectedSlotId(String? slotId) {
    state = state.copyWith(selectedSlotId: slotId);
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  // Get delivery fee based on current selection
  double getDeliveryFee(double subtotal) {
    final settings = state.settings;
    if (settings == null) return 0;

    // Free delivery above threshold
    if (subtotal >= settings.minOrderForFreeDelivery) {
      return 0;
    }

    if (state.deliveryType == 'instant') {
      return settings.instantDeliveryFee;
    }

    if (state.deliveryType == 'slotted' && state.selectedSlotId != null) {
      final slot = state.deliverySlots.firstWhere(
        (s) => s.id == state.selectedSlotId,
        orElse: () => const DeliverySlotModel(id: '', name: '', startTime: '', endTime: ''),
      );
      return slot.deliveryFee + settings.defaultDeliveryFee;
    }

    return settings.defaultDeliveryFee;
  }
}
