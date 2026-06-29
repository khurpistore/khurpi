import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';

abstract class BannerRepository {
  Future<Either<Failure, List<BannerModel>>> getBanners();
}
