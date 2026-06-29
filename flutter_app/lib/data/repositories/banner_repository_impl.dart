import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';
import 'package:khurpi_fresh/domain/repositories/banner_repository.dart';
import 'package:khurpi_fresh/data/datasources/remote/banner_remote_datasource.dart';

class BannerRepositoryImpl implements BannerRepository {
  final BannerRemoteDataSource remoteDataSource;

  BannerRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<BannerModel>>> getBanners() async {
    try {
      final banners = await remoteDataSource.getBanners();
      return Right(banners);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }
}
