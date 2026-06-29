import 'package:flutter/foundation.dart';
import '../models/order_model.dart';
import '../services/order_service.dart';

class OrderProvider with ChangeNotifier {
  final OrderService _orderService = OrderService();

  List<OrderModel> _orders = [];
  OrderModel? _selectedOrder;
  bool _isLoading = false;
  String? _error;

  List<OrderModel> get orders => _orders;
  OrderModel? get selectedOrder => _selectedOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch user orders
  Future<void> fetchOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _orders = await _orderService.getMyOrders();
      _orders.sort((a, b) => b.createdAt.compareTo(a.createdAt)); // Most recent first
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch single order
  Future<void> fetchOrder(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selectedOrder = await _orderService.getOrder(id);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create order
  Future<OrderModel?> createOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String deliverySlot,
    required DateTime deliveryDate,
    String? paymentMethod,
    String? notes,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final order = await _orderService.createOrder(
        items: items,
        deliveryAddress: deliveryAddress,
        deliverySlot: deliverySlot,
        deliveryDate: deliveryDate,
        paymentMethod: paymentMethod,
        notes: notes,
      );
      
      _orders.insert(0, order); // Add to beginning of list
      _isLoading = false;
      notifyListeners();
      return order;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // Cancel order
  Future<bool> cancelOrder(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final updatedOrder = await _orderService.cancelOrder(id);
      
      // Update in list
      final index = _orders.indexWhere((o) => o.id == id);
      if (index >= 0) {
        _orders[index] = updatedOrder;
      }
      
      // Update selected if same
      if (_selectedOrder?.id == id) {
        _selectedOrder = updatedOrder;
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Clear selected order
  void clearSelectedOrder() {
    _selectedOrder = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Get recent orders (last 5)
  List<OrderModel> get recentOrders => _orders.take(5).toList();

  // Get orders by status
  List<OrderModel> getOrdersByStatus(String status) {
    return _orders.where((o) => o.status == status).toList();
  }

  // Get active orders (not delivered/cancelled)
  List<OrderModel> get activeOrders {
    return _orders.where((o) => 
      o.status != 'delivered' && o.status != 'cancelled'
    ).toList();
  }
}
