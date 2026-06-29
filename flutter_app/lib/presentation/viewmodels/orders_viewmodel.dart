import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/usecases/order_usecases.dart';
import '../providers/providers.dart';

// ==================== State Classes ====================

class OrdersState {
  final List<OrderEntity> orders;
  final OrderEntity? selectedOrder;
  final bool isLoading;
  final String? error;

  const OrdersState({
    this.orders = const [],
    this.selectedOrder,
    this.isLoading = false,
    this.error,
  });

  OrdersState copyWith({
    List<OrderEntity>? orders,
    OrderEntity? selectedOrder,
    bool? isLoading,
    String? error,
    bool clearError = false,
    bool clearSelectedOrder = false,
  }) {
    return OrdersState(
      orders: orders ?? this.orders,
      selectedOrder: clearSelectedOrder ? null : (selectedOrder ?? this.selectedOrder),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }

  List<OrderEntity> get recentOrders => orders.take(5).toList();

  List<OrderEntity> get activeOrders {
    return orders.where((o) =>
      o.status != 'delivered' && o.status != 'cancelled'
    ).toList();
  }
}

// ==================== ViewModel ====================

class OrdersViewModel extends StateNotifier<OrdersState> {
  final GetMyOrdersUseCase _getMyOrdersUseCase;
  final GetOrderByIdUseCase _getOrderByIdUseCase;
  final CancelOrderUseCase _cancelOrderUseCase;
  final CreateOrderUseCase _createOrderUseCase;

  OrdersViewModel({
    required GetMyOrdersUseCase getMyOrdersUseCase,
    required GetOrderByIdUseCase getOrderByIdUseCase,
    required CancelOrderUseCase cancelOrderUseCase,
    required CreateOrderUseCase createOrderUseCase,
  })  : _getMyOrdersUseCase = getMyOrdersUseCase,
        _getOrderByIdUseCase = getOrderByIdUseCase,
        _cancelOrderUseCase = cancelOrderUseCase,
        _createOrderUseCase = createOrderUseCase,
        super(const OrdersState());

  Future<void> fetchOrders() async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _getMyOrdersUseCase();

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (orders) {
        final sorted = List<OrderEntity>.from(orders)
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
        state = state.copyWith(
          isLoading: false,
          orders: sorted,
        );
      },
    );
  }

  Future<void> fetchOrder(String id) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _getOrderByIdUseCase(id);

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (order) => state = state.copyWith(
        isLoading: false,
        selectedOrder: order,
      ),
    );
  }

  Future<OrderEntity?> createOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String deliverySlot,
    required DateTime deliveryDate,
    String? paymentMethod,
    String? notes,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _createOrderUseCase(CreateOrderParams(
      items: items,
      deliveryAddress: deliveryAddress,
      deliverySlot: deliverySlot,
      deliveryDate: deliveryDate,
      paymentMethod: paymentMethod,
      notes: notes,
    ));

    return result.fold(
      (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
        return null;
      },
      (order) {
        final updatedOrders = [order, ...state.orders];
        state = state.copyWith(isLoading: false, orders: updatedOrders);
        return order;
      },
    );
  }

  Future<bool> cancelOrder(String id) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _cancelOrderUseCase(id);

    return result.fold(
      (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
        return false;
      },
      (updatedOrder) {
        final updatedOrders = state.orders.map((o) {
          return o.id == id ? updatedOrder : o;
        }).toList();

        state = state.copyWith(
          isLoading: false,
          orders: updatedOrders,
          selectedOrder: state.selectedOrder?.id == id ? updatedOrder : state.selectedOrder,
        );
        return true;
      },
    );
  }

  void clearSelectedOrder() {
    state = state.copyWith(clearSelectedOrder: true);
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

// ==================== Provider ====================

final ordersViewModelProvider =
    StateNotifierProvider<OrdersViewModel, OrdersState>((ref) {
  return OrdersViewModel(
    getMyOrdersUseCase: ref.watch(getMyOrdersUseCaseProvider),
    getOrderByIdUseCase: ref.watch(getOrderByIdUseCaseProvider),
    cancelOrderUseCase: ref.watch(cancelOrderUseCaseProvider),
    createOrderUseCase: ref.watch(createOrderUseCaseProvider),
  );
});
