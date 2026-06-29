import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/domain/entities/product_entity.dart';
import 'package:khurpi_fresh/domain/entities/category_entity.dart';

abstract class ProductRepository {
  /// Get all products with optional filters
  Future<Either<Failure, List<ProductEntity>>> getProducts({
    String? search,
    String? categoryId,
  });

  /// Get single product by ID
  Future<Either<Failure, ProductEntity>> getProductById(String id);

  /// Get products by category
  Future<Either<Failure, List<ProductEntity>>> getProductsByCategory(String categoryId);

  /// Get all categories
  Future<Either<Failure, List<CategoryEntity>>> getCategories();

  /// Get single category by ID
  Future<Either<Failure, CategoryEntity>> getCategoryById(String id);
}
