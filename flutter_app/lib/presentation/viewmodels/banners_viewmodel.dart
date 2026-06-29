import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/domain/entities/banner_entity.dart';
import 'package:khurpi_fresh/domain/repositories/banner_repository.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

// ==================== State Classes ====================

class BannersState {
  final List<BannerEntity> banners;
  final bool isLoading;
  final String? error;

  const BannersState({
    this.banners = const [],
    this.isLoading = false,
    this.error,
  });

  BannersState copyWith({
    List<BannerEntity>? banners,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return BannersState(
      banners: banners ?? this.banners,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

// ==================== ViewModel ====================

class BannersViewModel extends StateNotifier<BannersState> {
  final BannerRepository _bannerRepository;

  BannersViewModel({required BannerRepository bannerRepository})
      : _bannerRepository = bannerRepository,
        super(const BannersState());

  Future<void> fetchBanners() async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _bannerRepository.getBanners();

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (banners) => state = state.copyWith(
        isLoading: false,
        banners: banners,
      ),
    );
  }
}

// ==================== Provider ====================

final bannersViewModelProvider =
    StateNotifierProvider<BannersViewModel, BannersState>((ref) {
  return BannersViewModel(
    bannerRepository: ref.watch(bannerRepositoryProvider),
  );
});
