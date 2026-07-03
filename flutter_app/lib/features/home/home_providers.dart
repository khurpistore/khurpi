import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/features/home/banners_viewmodel.dart';
import 'package:khurpi_fresh/features/home/store_viewmodel.dart';
import 'package:khurpi_fresh/features/providers.dart';

export 'package:khurpi_fresh/features/home/banners_viewmodel.dart';
export 'package:khurpi_fresh/features/home/store_viewmodel.dart';

// ==================== Banners ViewModel Provider ====================

final provideBannersViewModelProvider = Provider<BannersState?>(
  (ref) {
    final bannerDS = ref.watch(provideBannerRemoteDataSourceProvider);

    if (bannerDS == null) return null;

    return ref.watch(
      bannersViewModelProvider(bannerRemoteDataSource: bannerDS),
    );
  },
);

final provideBannersViewModelNotifierProvider =
    Provider<BannersViewModel?>(
  (ref) {
    final bannerDS = ref.watch(provideBannerRemoteDataSourceProvider);

    if (bannerDS == null) return null;

    return ref.watch(
      bannersViewModelProvider(bannerRemoteDataSource: bannerDS).notifier,
    );
  },
);

// ==================== Store ViewModel Provider ====================

final provideStoreViewModelProvider = Provider<StoreState?>(
  (ref) {
    final storeDS = ref.watch(provideStoreRemoteDataSourceProvider);

    if (storeDS == null) return null;

    return ref.watch(
      storeViewModelProvider(storeRemoteDataSource: storeDS),
    );
  },
);

final provideStoreViewModelNotifierProvider =
    Provider<StoreViewModel?>(
  (ref) {
    final storeDS = ref.watch(provideStoreRemoteDataSourceProvider);

    if (storeDS == null) return null;

    return ref.watch(
      storeViewModelProvider(storeRemoteDataSource: storeDS).notifier,
    );
  },
);

