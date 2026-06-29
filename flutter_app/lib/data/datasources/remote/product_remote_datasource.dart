import 'package:khurpi_fresh/core/network/api_client.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';

abstract class ProductRemoteDataSource {
  Future<List<ProductModel>> getProducts({String? search, String? categoryId});
  Future<ProductModel> getProductById(String id);
  Future<List<ProductModel>> getProductsByCategory(String categoryId);
  Future<List<CategoryModel>> getCategories();
  Future<CategoryModel> getCategoryById(String id);
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final ApiClient apiClient;

  ProductRemoteDataSourceImpl(this.apiClient);

  @override
  Future<List<ProductModel>> getProducts({String? search, String? categoryId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (categoryId != null && categoryId.isNotEmpty) queryParams['category_id'] = categoryId;

      final response = await apiClient.get('/products', queryParams: queryParams);
      final List<dynamic> data = response is List ? response : (response['products'] ?? []);
      return data.map((json) => ProductModel.fromJson(json)).toList();
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch products: $e');
    }
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    try {
      final response = await apiClient.get('/products/$id');
      return ProductModel.fromJson(response);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch product: $e');
    }
  }

  @override
  Future<List<ProductModel>> getProductsByCategory(String categoryId) async {
    try {
      final response = await apiClient.get('/categories/$categoryId/products');
      final List<dynamic> data = response is List ? response : (response['products'] ?? []);
      return data.map((json) => ProductModel.fromJson(json)).toList();
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch products by category: $e');
    }
  }

  @override
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await apiClient.get('/categories');
      final List<dynamic> data = response is List ? response : (response['categories'] ?? []);
      return data.map((json) => CategoryModel.fromJson(json)).toList();
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch categories: $e');
    }
  }

  @override
  Future<CategoryModel> getCategoryById(String id) async {
    try {
      final response = await apiClient.get('/categories/$id');
      return CategoryModel.fromJson(response);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch category: $e');
    }
  }
}
