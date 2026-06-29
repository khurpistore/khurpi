import 'package:khurpi_fresh/core/network/api_client.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';

abstract class BannerRemoteDataSource {
  Future<List<BannerModel>> getBanners();
}

class BannerRemoteDataSourceImpl implements BannerRemoteDataSource {
  final ApiClient apiClient;

  BannerRemoteDataSourceImpl(this.apiClient);

  @override
  Future<List<BannerModel>> getBanners() async {
    try {
      final response = await apiClient.get('/banners');
      final List<dynamic> data = response is List ? response : (response['banners'] ?? []);
      return data.map((json) => BannerModel.fromJson(json)).toList();
    } catch (e) {
      // Return default banners on failure
      return _getDefaultBanners();
    }
  }

  List<BannerModel> _getDefaultBanners() {
    return const [
      BannerModel(
        id: '1',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
        title: 'Fresh Vegetables',
        subtitle: 'Farm to Table',
        displayOrder: 1,
      ),
      BannerModel(
        id: '2',
        imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
        title: 'Organic Fruits',
        subtitle: 'Naturally Sweet',
        displayOrder: 2,
      ),
      BannerModel(
        id: '3',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
        title: 'Leafy Greens',
        subtitle: 'Freshly Picked',
        displayOrder: 3,
      ),
    ];
  }
}
