import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/api/product_api_service.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';

abstract class ProductRemoteDataSource {
  Future<List<ProductModel>> getProducts();
  Future<ProductModel> getProductById(String id);
  Future<List<CategoryModel>> getCategories();
  Future<List<ProductModel>> getProductsByCategory(String categoryId);
  Future<List<ProductModel>> searchProducts(String query);
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final ProductApiService _apiService;

  ProductRemoteDataSourceImpl(this._apiService);

  @override
  Future<List<ProductModel>> getProducts() async {
    try {
      return await _apiService.getProducts();
    } catch (e) {
      throw ServerException(message: 'Failed to fetch products: $e');
    }
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    try {
      return await _apiService.getProductById(id);
    } catch (e) {
      throw ServerException(message: 'Failed to fetch product: $e');
    }
  }

  @override
  Future<List<CategoryModel>> getCategories() async {
    try {
      return await _apiService.getCategories();
    } catch (e) {
      throw ServerException(message: 'Failed to fetch categories: $e');
    }
  }

  @override
  Future<List<ProductModel>> getProductsByCategory(String categoryId) async {
    try {
      return await _apiService.getProductsByCategory(categoryId);
    } catch (e) {
      throw ServerException(message: 'Failed to fetch products by category: $e');
    }
  }

  @override
  Future<List<ProductModel>> searchProducts(String query) async {
    try {
      return await _apiService.searchProducts(query);
    } catch (e) {
      throw ServerException(message: 'Failed to search products: $e');
    }
  }
}
