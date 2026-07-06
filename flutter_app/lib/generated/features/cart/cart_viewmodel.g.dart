// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../features/cart/cart_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(CartViewModel)
final cartViewModelProvider = CartViewModelFamily._();

final class CartViewModelProvider
    extends $NotifierProvider<CartViewModel, CartState> {
  CartViewModelProvider._({
    required CartViewModelFamily super.from,
    required ({
      CartLocalDataSource cartLocalDataSource,
      SharedPreferences sharedPreferences,
    })
    super.argument,
  }) : super(
         retry: null,
         name: r'cartViewModelProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$cartViewModelHash();

  @override
  String toString() {
    return r'cartViewModelProvider'
        ''
        '$argument';
  }

  @$internal
  @override
  CartViewModel create() => CartViewModel();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(CartState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<CartState>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is CartViewModelProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$cartViewModelHash() => r'a3820f6fc7f741edff18ef591b366f9301b62d8e';

final class CartViewModelFamily extends $Family
    with
        $ClassFamilyOverride<
          CartViewModel,
          CartState,
          CartState,
          CartState,
          ({
            CartLocalDataSource cartLocalDataSource,
            SharedPreferences sharedPreferences,
          })
        > {
  CartViewModelFamily._()
    : super(
        retry: null,
        name: r'cartViewModelProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  CartViewModelProvider call({
    required CartLocalDataSource cartLocalDataSource,
    required SharedPreferences sharedPreferences,
  }) => CartViewModelProvider._(
    argument: (
      cartLocalDataSource: cartLocalDataSource,
      sharedPreferences: sharedPreferences,
    ),
    from: this,
  );

  @override
  String toString() => r'cartViewModelProvider';
}

abstract class _$CartViewModel extends $Notifier<CartState> {
  late final _$args =
      ref.$arg
          as ({
            CartLocalDataSource cartLocalDataSource,
            SharedPreferences sharedPreferences,
          });
  CartLocalDataSource get cartLocalDataSource => _$args.cartLocalDataSource;
  SharedPreferences get sharedPreferences => _$args.sharedPreferences;

  CartState build({
    required CartLocalDataSource cartLocalDataSource,
    required SharedPreferences sharedPreferences,
  });
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<CartState, CartState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<CartState, CartState>,
              CartState,
              Object?,
              Object?
            >;
    element.handleCreate(
      ref,
      () => build(
        cartLocalDataSource: _$args.cartLocalDataSource,
        sharedPreferences: _$args.sharedPreferences,
      ),
    );
  }
}
