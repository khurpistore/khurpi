import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';

abstract class ProductRepository {
  Future<Either<Failure, List<ProductModel>>> getProducts();
  Future<Either<Failure, ProductModel>> getProductById(String id);
  Future<Either<Failure, List<CategoryModel>>> getCategories();
  Future<Either<Failure, List<ProductModel>>> getProductsByCategory(String categoryId);
  Future<Either<Failure, List<ProductModel>>> searchProducts(String query);
}
