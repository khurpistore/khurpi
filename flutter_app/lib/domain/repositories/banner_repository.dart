import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/domain/entities/banner_entity.dart';

abstract class BannerRepository {
  /// Get all active banners
  Future<Either<Failure, List<BannerEntity>>> getBanners();
}
