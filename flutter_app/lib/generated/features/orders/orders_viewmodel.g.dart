// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../features/orders/orders_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(OrdersViewModel)
final ordersViewModelProvider = OrdersViewModelFamily._();

final class OrdersViewModelProvider
    extends $NotifierProvider<OrdersViewModel, OrdersState> {
  OrdersViewModelProvider._({
    required OrdersViewModelFamily super.from,
    required OrderRemoteDataSource super.argument,
  }) : super(
         retry: null,
         name: r'ordersViewModelProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$ordersViewModelHash();

  @override
  String toString() {
    return r'ordersViewModelProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  OrdersViewModel create() => OrdersViewModel();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(OrdersState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<OrdersState>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is OrdersViewModelProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$ordersViewModelHash() => r'0e99264b29487ee67526eb3512e7ba799c674968';

final class OrdersViewModelFamily extends $Family
    with
        $ClassFamilyOverride<
          OrdersViewModel,
          OrdersState,
          OrdersState,
          OrdersState,
          OrderRemoteDataSource
        > {
  OrdersViewModelFamily._()
    : super(
        retry: null,
        name: r'ordersViewModelProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  OrdersViewModelProvider call({
    required OrderRemoteDataSource orderRemoteDataSource,
  }) => OrdersViewModelProvider._(argument: orderRemoteDataSource, from: this);

  @override
  String toString() => r'ordersViewModelProvider';
}

abstract class _$OrdersViewModel extends $Notifier<OrdersState> {
  late final _$args = ref.$arg as OrderRemoteDataSource;
  OrderRemoteDataSource get orderRemoteDataSource => _$args;

  OrdersState build({required OrderRemoteDataSource orderRemoteDataSource});
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<OrdersState, OrdersState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<OrdersState, OrdersState>,
              OrdersState,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(orderRemoteDataSource: _$args));
  }
}
