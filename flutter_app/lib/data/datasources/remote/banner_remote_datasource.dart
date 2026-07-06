import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/api/banner_api_service.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';

abstract class BannerRemoteDataSource {
  Future<List<BannerModel>> getBanners();
}

class BannerRemoteDataSourceImpl implements BannerRemoteDataSource {
  final BannerApiService _apiService;

  BannerRemoteDataSourceImpl(this._apiService);

  @override
  Future<List<BannerModel>> getBanners() async {
    try {
      return await _apiService.getBanners();
    } catch (e) {
      throw ServerException(message: 'Failed to fetch banners: $e');
    }
  }
}
