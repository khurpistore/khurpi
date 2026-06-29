import '../models/banner_model.dart';
import 'api_service.dart';

class BannerService {
  final ApiService _api = ApiService();

  // Get all active banners
  Future<List<BannerModel>> getBanners() async {
    try {
      final response = await _api.get('/banners');
      final List<dynamic> data = response is List ? response : (response['banners'] ?? []);
      return data
          .map((json) => BannerModel.fromJson(json))
          .where((banner) => banner.isActive)
          .toList()
        ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
    } catch (e) {
      // Return default banners if API fails
      return _getDefaultBanners();
    }
  }

  // Default banners for fallback
  List<BannerModel> _getDefaultBanners() {
    return [
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
