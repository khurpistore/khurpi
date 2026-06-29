import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/banner_remote_datasource.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

part '../../generated/viewmodels/banners_viewmodel.freezed.dart';
part '../../generated/viewmodels/banners_viewmodel.g.dart';

@freezed
sealed class BannersState with _$BannersState {
  const factory BannersState({
    @Default(false) bool isLoading,
    @Default([]) List<BannerModel> banners,
    String? errorMessage,
  }) = _BannersState;
}

@Riverpod(keepAlive: true)
class BannersViewModel extends _$BannersViewModel {
  late final BannerRemoteDataSource _bannerRemoteDataSource;

  @override
  BannersState build() {
    final remoteDS = ref.watch(provideBannerRemoteDataSourceProvider);
    
    if (remoteDS != null) {
      _bannerRemoteDataSource = remoteDS;
    }
    
    return const BannersState();
  }

  Future<void> loadBanners() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final banners = await _bannerRemoteDataSource.getBanners();
      state = state.copyWith(
        isLoading: false,
        banners: banners,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}
