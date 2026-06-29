import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';

part 'banner_api_service.g.dart';

@RestApi()
abstract class BannerApiService {
  factory BannerApiService(Dio dio, {String baseUrl}) = _BannerApiService;

  @GET('/banners')
  Future<List<BannerModel>> getBanners();
}
