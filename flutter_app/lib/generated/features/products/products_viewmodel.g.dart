// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../features/products/products_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(ProductsViewModel)
final productsViewModelProvider = ProductsViewModelFamily._();

final class ProductsViewModelProvider
    extends $NotifierProvider<ProductsViewModel, ProductsState> {
  ProductsViewModelProvider._({
    required ProductsViewModelFamily super.from,
    required ProductRemoteDataSource super.argument,
  }) : super(
         retry: null,
         name: r'productsViewModelProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$productsViewModelHash();

  @override
  String toString() {
    return r'productsViewModelProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  ProductsViewModel create() => ProductsViewModel();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ProductsState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ProductsState>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is ProductsViewModelProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$productsViewModelHash() => r'f39db1b715f160276e0989d4c3cf1f507ec8a906';

final class ProductsViewModelFamily extends $Family
    with
        $ClassFamilyOverride<
          ProductsViewModel,
          ProductsState,
          ProductsState,
          ProductsState,
          ProductRemoteDataSource
        > {
  ProductsViewModelFamily._()
    : super(
        retry: null,
        name: r'productsViewModelProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  ProductsViewModelProvider call({
    required ProductRemoteDataSource productRemoteDataSource,
  }) => ProductsViewModelProvider._(
    argument: productRemoteDataSource,
    from: this,
  );

  @override
  String toString() => r'productsViewModelProvider';
}

abstract class _$ProductsViewModel extends $Notifier<ProductsState> {
  late final _$args = ref.$arg as ProductRemoteDataSource;
  ProductRemoteDataSource get productRemoteDataSource => _$args;

  ProductsState build({
    required ProductRemoteDataSource productRemoteDataSource,
  });
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<ProductsState, ProductsState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<ProductsState, ProductsState>,
              ProductsState,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(productRemoteDataSource: _$args));
  }
}
