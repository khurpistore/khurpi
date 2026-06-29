import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/core/usecase/usecase.dart';
import 'package:khurpi_fresh/domain/entities/product_entity.dart';
import 'package:khurpi_fresh/domain/entities/category_entity.dart';
import 'package:khurpi_fresh/domain/repositories/product_repository.dart';

// Get Products Use Case
class GetProductsUseCase implements UseCase<List<ProductEntity>, GetProductsParams> {
  final ProductRepository repository;

  GetProductsUseCase(this.repository);

  @override
  Future<Either<Failure, List<ProductEntity>>> call(GetProductsParams params) {
    return repository.getProducts(
      search: params.search,
      categoryId: params.categoryId,
    );
  }
}

class GetProductsParams {
  final String? search;
  final String? categoryId;

  GetProductsParams({this.search, this.categoryId});
}

// Get Product By ID Use Case
class GetProductByIdUseCase implements UseCase<ProductEntity, String> {
  final ProductRepository repository;

  GetProductByIdUseCase(this.repository);

  @override
  Future<Either<Failure, ProductEntity>> call(String id) {
    return repository.getProductById(id);
  }
}

// Get Categories Use Case
class GetCategoriesUseCase implements UseCaseNoParams<List<CategoryEntity>> {
  final ProductRepository repository;

  GetCategoriesUseCase(this.repository);

  @override
  Future<Either<Failure, List<CategoryEntity>>> call() {
    return repository.getCategories();
  }
}

// Get Products By Category Use Case
class GetProductsByCategoryUseCase implements UseCase<List<ProductEntity>, String> {
  final ProductRepository repository;

  GetProductsByCategoryUseCase(this.repository);

  @override
  Future<Either<Failure, List<ProductEntity>>> call(String categoryId) {
    return repository.getProductsByCategory(categoryId);
  }
}
