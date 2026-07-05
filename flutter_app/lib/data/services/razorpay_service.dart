import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';

class RazorpayService {
  final Dio _dio;

  RazorpayService() : _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));

  /// Create a Razorpay order on the backend
  Future<Map<String, dynamic>> createOrder({
    required double amount,
    required String receipt,
    Map<String, dynamic>? notes,
  }) async {
    try {
      final response = await _dio.post(
        '/payments/create-order',
        data: {
          'amount': amount,
          'receipt': receipt,
          'notes': notes,
        },
      );
      
      if (response.data is Map<String, dynamic>) {
        return response.data;
      }
      throw Exception('Invalid response format');
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = 'Network error';
      if (errorData is Map && errorData['detail'] != null) {
        errorMessage = errorData['detail'].toString();
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      throw Exception('Failed to create payment order: $errorMessage');
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Failed to create payment order: $e');
    }
  }

  /// Verify payment signature on the backend
  Future<Map<String, dynamic>> verifyPayment({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    try {
      final response = await _dio.post(
        '/payments/verify',
        data: {
          'razorpay_order_id': razorpayOrderId,
          'razorpay_payment_id': razorpayPaymentId,
          'razorpay_signature': razorpaySignature,
        },
      );
      
      if (response.data is Map<String, dynamic>) {
        return response.data;
      }
      throw Exception('Invalid response format');
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = 'Network error';
      if (errorData is Map && errorData['detail'] != null) {
        errorMessage = errorData['detail'].toString();
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      throw Exception('Failed to verify payment: $errorMessage');
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Failed to verify payment: $e');
    }
  }
}
