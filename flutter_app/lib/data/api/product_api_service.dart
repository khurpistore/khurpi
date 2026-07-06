import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';

part '../../generated/data/api/product_api_service.g.dart';

@RestApi()
abstract class ProductApiService {
  factory ProductApiService(Dio dio, {String baseUrl}) = _ProductApiService;

  @GET('/products')
  Future<List<ProductModel>> getProducts();

  @GET('/products/{id}')
  Future<ProductModel> getProductById(@Path('id') String id);

  @GET('/categories')
  Future<List<CategoryModel>> getCategories();

  @GET('/categories/{id}/products')
  Future<List<ProductModel>> getProductsByCategory(@Path('id') String categoryId);

  @GET('/products/search')
  Future<List<ProductModel>> searchProducts(@Query('q') String query);
}
