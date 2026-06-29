import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../entities/banner_entity.dart';

abstract class BannerRepository {
  /// Get all active banners
  Future<Either<Failure, List<BannerEntity>>> getBanners();
}
