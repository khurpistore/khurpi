import '../models/product_model.dart';
import '../models/category_model.dart';
import 'api_service.dart';

class ProductService {
  final ApiService _api = ApiService();

  // Get all products
  Future<List<ProductModel>> getProducts({String? search, String? categoryId}) async {
    String endpoint = '/products';
    final params = <String, String>{};
    
    if (search != null && search.isNotEmpty) {
      params['search'] = search;
    }
    if (categoryId != null && categoryId.isNotEmpty) {
      params['category_id'] = categoryId;
    }
    
    if (params.isNotEmpty) {
      endpoint += '?${params.entries.map((e) => '${e.key}=${e.value}').join('&')}';
    }
    
    final response = await _api.get(endpoint);
    final List<dynamic> data = response is List ? response : (response['products'] ?? []);
    return data.map((json) => ProductModel.fromJson(json)).toList();
  }

  // Get single product
  Future<ProductModel> getProduct(String id) async {
    final response = await _api.get('/products/$id');
    return ProductModel.fromJson(response);
  }

  // Get products by category
  Future<List<ProductModel>> getProductsByCategory(String categoryId) async {
    final response = await _api.get('/categories/$categoryId/products');
    final List<dynamic> data = response is List ? response : (response['products'] ?? []);
    return data.map((json) => ProductModel.fromJson(json)).toList();
  }

  // Get all categories
  Future<List<CategoryModel>> getCategories() async {
    final response = await _api.get('/categories');
    final List<dynamic> data = response is List ? response : (response['categories'] ?? []);
    return data.map((json) => CategoryModel.fromJson(json)).toList();
  }

  // Get single category
  Future<CategoryModel> getCategory(String id) async {
    final response = await _api.get('/categories/$id');
    return CategoryModel.fromJson(response);
  }
}
