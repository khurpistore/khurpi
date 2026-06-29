import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/banner_remote_datasource.dart';

part 'banners_viewmodel.freezed.dart';

@freezed
sealed class BannersState with _$BannersState {
  const factory BannersState({
    @Default(false) bool isLoading,
    @Default([]) List<BannerModel> banners,
    String? errorMessage,
  }) = _BannersState;
}

class BannersViewModel extends StateNotifier<BannersState> {
  final BannerRemoteDataSource _bannerRemoteDataSource;

  BannersViewModel({
    required BannerRemoteDataSource bannerRemoteDataSource,
  })  : _bannerRemoteDataSource = bannerRemoteDataSource,
        super(const BannersState());

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
