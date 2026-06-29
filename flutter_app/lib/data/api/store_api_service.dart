import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:khurpi_fresh/data/models/store_settings_model.dart';
import 'package:khurpi_fresh/data/models/delivery_slot_model.dart';

part 'store_api_service.g.dart';

@RestApi()
abstract class StoreApiService {
  factory StoreApiService(Dio dio, {String baseUrl}) = _StoreApiService;

  @GET('/store/settings')
  Future<StoreSettingsModel> getStoreSettings();

  @GET('/delivery-slots')
  Future<List<DeliverySlotModel>> getDeliverySlots(@Query('date') String? date);
}
