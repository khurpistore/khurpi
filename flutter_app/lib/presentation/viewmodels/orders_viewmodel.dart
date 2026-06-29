import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/order_remote_datasource.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

part 'orders_viewmodel.freezed.dart';
part 'orders_viewmodel.g.dart';

@freezed
sealed class OrdersState with _$OrdersState {
  const factory OrdersState({
    @Default(false) bool isLoading,
    @Default([]) List<OrderModel> orders,
    OrderModel? currentOrder,
    String? errorMessage,
  }) = _OrdersState;
}

@Riverpod(keepAlive: true)
class OrdersViewModel extends _$OrdersViewModel {
  late final OrderRemoteDataSource _orderRemoteDataSource;

  @override
  OrdersState build() {
    final remoteDS = ref.watch(provideOrderRemoteDataSourceProvider);
    
    if (remoteDS != null) {
      _orderRemoteDataSource = remoteDS;
    }
    
    return const OrdersState();
  }

  Future<void> loadOrders() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final orders = await _orderRemoteDataSource.getMyOrders();
      state = state.copyWith(
        isLoading: false,
        orders: orders,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> loadOrderById(String orderId) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final order = await _orderRemoteDataSource.getOrderById(orderId);
      state = state.copyWith(
        isLoading: false,
        currentOrder: order,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<OrderModel?> createOrder({
    required List<CartItemModel> items,
    required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    required String paymentMethod,
    String? notes,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final order = await _orderRemoteDataSource.createOrder(
        items: items,
        deliveryAddress: deliveryAddress,
        city: city,
        pincode: pincode,
        phone: phone,
        paymentMethod: paymentMethod,
        notes: notes,
      );

      state = state.copyWith(
        isLoading: false,
        currentOrder: order,
        orders: [order, ...state.orders],
      );

      return order;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
      return null;
    }
  }

  Future<bool> cancelOrder(String orderId) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final order = await _orderRemoteDataSource.cancelOrder(orderId);

      final updatedOrders = state.orders.map((o) {
        if (o.orderId == orderId) {
          return order;
        }
        return o;
      }).toList();

      state = state.copyWith(
        isLoading: false,
        orders: updatedOrders,
        currentOrder: order,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}
