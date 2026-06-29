import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/api/store_api_service.dart';
import 'package:khurpi_fresh/data/models/store_settings_model.dart';
import 'package:khurpi_fresh/data/models/delivery_slot_model.dart';

abstract class StoreRemoteDataSource {
  Future<StoreSettingsModel> getStoreSettings();
  Future<List<DeliverySlotModel>> getDeliverySlots(String? date);
}

class StoreRemoteDataSourceImpl implements StoreRemoteDataSource {
  final StoreApiService _apiService;

  StoreRemoteDataSourceImpl(this._apiService);

  @override
  Future<StoreSettingsModel> getStoreSettings() async {
    try {
      return await _apiService.getStoreSettings();
    } catch (e) {
      throw ServerException(message: 'Failed to fetch store settings: $e');
    }
  }

  @override
  Future<List<DeliverySlotModel>> getDeliverySlots(String? date) async {
    try {
      return await _apiService.getDeliverySlots(date);
    } catch (e) {
      throw ServerException(message: 'Failed to fetch delivery slots: $e');
    }
  }
}
