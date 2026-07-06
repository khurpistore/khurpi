// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../features/products/product_detail_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(ProductDetailViewModel)
final productDetailViewModelProvider = ProductDetailViewModelFamily._();

final class ProductDetailViewModelProvider
    extends $NotifierProvider<ProductDetailViewModel, ProductDetailState> {
  ProductDetailViewModelProvider._({
    required ProductDetailViewModelFamily super.from,
    required ProductRemoteDataSource super.argument,
  }) : super(
         retry: null,
         name: r'productDetailViewModelProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$productDetailViewModelHash();

  @override
  String toString() {
    return r'productDetailViewModelProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  ProductDetailViewModel create() => ProductDetailViewModel();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ProductDetailState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ProductDetailState>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is ProductDetailViewModelProvider &&
        other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$productDetailViewModelHash() =>
    r'13d1d23fd96edc550fea5addbfddabd39e07f6a7';

final class ProductDetailViewModelFamily extends $Family
    with
        $ClassFamilyOverride<
          ProductDetailViewModel,
          ProductDetailState,
          ProductDetailState,
          ProductDetailState,
          ProductRemoteDataSource
        > {
  ProductDetailViewModelFamily._()
    : super(
        retry: null,
        name: r'productDetailViewModelProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  ProductDetailViewModelProvider call({
    required ProductRemoteDataSource productRemoteDataSource,
  }) => ProductDetailViewModelProvider._(
    argument: productRemoteDataSource,
    from: this,
  );

  @override
  String toString() => r'productDetailViewModelProvider';
}

abstract class _$ProductDetailViewModel extends $Notifier<ProductDetailState> {
  late final _$args = ref.$arg as ProductRemoteDataSource;
  ProductRemoteDataSource get productRemoteDataSource => _$args;

  ProductDetailState build({
    required ProductRemoteDataSource productRemoteDataSource,
  });
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<ProductDetailState, ProductDetailState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<ProductDetailState, ProductDetailState>,
              ProductDetailState,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(productRemoteDataSource: _$args));
  }
}
