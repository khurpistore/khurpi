import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

part 'banners_viewmodel.g.dart';
part 'banners_viewmodel.freezed.dart';

@freezed
class BannersState with _$BannersState {
  const factory BannersState({
    @Default(false) bool isLoading,
    @Default([]) List<BannerModel> banners,
    String? errorMessage,
  }) = _BannersState;
}

@riverpod
class BannersViewModel extends _$BannersViewModel {
  @override
  BannersState build() {
    return const BannersState();
  }

  Future<void> loadBanners() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    
    try {
      final banners = await ref.read(bannerRemoteDataSourceProvider).getBanners();
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
