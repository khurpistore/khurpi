import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/network/dio_client.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';

abstract class VendorRemoteDataSource {
  Future<List<ProductModel>> getProducts();
  Future<ProductModel> updateProduct(
    String id, {
    double? price,
    double? mrp,
    int? stockQuantity,
  });
}

class VendorRemoteDataSourceImpl implements VendorRemoteDataSource {
  final Dio _dio = DioClient.instance;

  @override
  Future<List<ProductModel>> getProducts() async {
    try {
      final response = await _dio.get('/vendor/products');
      return (response.data as List)
          .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ServerException(message: 'Failed to fetch products: $e');
    }
  }

  @override
  Future<ProductModel> updateProduct(
    String id, {
    double? price,
    double? mrp,
    int? stockQuantity,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (price != null) data['price'] = price;
      if (mrp != null) data['mrp'] = mrp;
      if (stockQuantity != null) data['stock_quantity'] = stockQuantity;
      final response = await _dio.put('/vendor/products/$id', data: data);
      return ProductModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw ServerException(message: 'Failed to update product: $e');
    }
  }
}
