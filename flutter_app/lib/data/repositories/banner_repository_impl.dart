import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../../domain/entities/banner_entity.dart';
import '../../domain/repositories/banner_repository.dart';
import '../datasources/remote/banner_remote_datasource.dart';

class BannerRepositoryImpl implements BannerRepository {
  final BannerRemoteDataSource remoteDataSource;

  BannerRepositoryImpl(this.remoteDataSource);

  @override
  Future<Either<Failure, List<BannerEntity>>> getBanners() async {
    try {
      final banners = await remoteDataSource.getBanners();
      final activeBanners = banners.where((b) => b.isActive).toList();
      activeBanners.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      return Right(activeBanners);
    } catch (e) {
      return Left(ServerFailure(message: 'Failed to fetch banners: $e'));
    }
  }
}
