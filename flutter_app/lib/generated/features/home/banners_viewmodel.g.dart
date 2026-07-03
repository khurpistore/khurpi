// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../features/home/banners_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(BannersViewModel)
final bannersViewModelProvider = BannersViewModelFamily._();

final class BannersViewModelProvider
    extends $NotifierProvider<BannersViewModel, BannersState> {
  BannersViewModelProvider._({
    required BannersViewModelFamily super.from,
    required BannerRemoteDataSource super.argument,
  }) : super(
         retry: null,
         name: r'bannersViewModelProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$bannersViewModelHash();

  @override
  String toString() {
    return r'bannersViewModelProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  BannersViewModel create() => BannersViewModel();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(BannersState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<BannersState>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is BannersViewModelProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$bannersViewModelHash() => r'29e92df9fe9660cf17f7f9453c2b06a0e7771ac0';

final class BannersViewModelFamily extends $Family
    with
        $ClassFamilyOverride<
          BannersViewModel,
          BannersState,
          BannersState,
          BannersState,
          BannerRemoteDataSource
        > {
  BannersViewModelFamily._()
    : super(
        retry: null,
        name: r'bannersViewModelProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  BannersViewModelProvider call({
    required BannerRemoteDataSource bannerRemoteDataSource,
  }) =>
      BannersViewModelProvider._(argument: bannerRemoteDataSource, from: this);

  @override
  String toString() => r'bannersViewModelProvider';
}

abstract class _$BannersViewModel extends $Notifier<BannersState> {
  late final _$args = ref.$arg as BannerRemoteDataSource;
  BannerRemoteDataSource get bannerRemoteDataSource => _$args;

  BannersState build({required BannerRemoteDataSource bannerRemoteDataSource});
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<BannersState, BannersState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<BannersState, BannersState>,
              BannersState,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(bannerRemoteDataSource: _$args));
  }
}
