// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../features/home/store_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(StoreViewModel)
final storeViewModelProvider = StoreViewModelFamily._();

final class StoreViewModelProvider
    extends $NotifierProvider<StoreViewModel, StoreState> {
  StoreViewModelProvider._({
    required StoreViewModelFamily super.from,
    required StoreRemoteDataSource super.argument,
  }) : super(
         retry: null,
         name: r'storeViewModelProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$storeViewModelHash();

  @override
  String toString() {
    return r'storeViewModelProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  StoreViewModel create() => StoreViewModel();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(StoreState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<StoreState>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is StoreViewModelProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$storeViewModelHash() => r'e9d05fce7953ed9e04356e0d34a0c47797b8970b';

final class StoreViewModelFamily extends $Family
    with
        $ClassFamilyOverride<
          StoreViewModel,
          StoreState,
          StoreState,
          StoreState,
          StoreRemoteDataSource
        > {
  StoreViewModelFamily._()
    : super(
        retry: null,
        name: r'storeViewModelProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  StoreViewModelProvider call({
    required StoreRemoteDataSource storeRemoteDataSource,
  }) => StoreViewModelProvider._(argument: storeRemoteDataSource, from: this);

  @override
  String toString() => r'storeViewModelProvider';
}

abstract class _$StoreViewModel extends $Notifier<StoreState> {
  late final _$args = ref.$arg as StoreRemoteDataSource;
  StoreRemoteDataSource get storeRemoteDataSource => _$args;

  StoreState build({required StoreRemoteDataSource storeRemoteDataSource});
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<StoreState, StoreState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<StoreState, StoreState>,
              StoreState,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(storeRemoteDataSource: _$args));
  }
}
