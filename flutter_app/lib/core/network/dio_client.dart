import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';

class DioClient {
  static Dio? _dio;
  static String? _authToken;

  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.addAll([
      _AuthInterceptor(),
      _LoggingInterceptor(),
    ]);

    return dio;
  }

  static void setAuthToken(String? token) {
    _authToken = token;
  }

  static String? get authToken => _authToken;

  static void clearToken() {
    _authToken = null;
  }
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = DioClient.authToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      DioClient.clearToken();
    }
    handler.next(err);
  }
}

class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('┌─────────────────────────────────────────────────────────');
    print('│ 🌐 REQUEST: ${options.method} ${options.uri}');
    if (options.data != null) {
      print('│ 📦 Body: ${options.data}');
    }
    print('└─────────────────────────────────────────────────────────');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('┌─────────────────────────────────────────────────────────');
    print('│ ✅ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}');
    print('└─────────────────────────────────────────────────────────');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print('┌─────────────────────────────────────────────────────────');
    print('│ ❌ ERROR: ${err.response?.statusCode} ${err.requestOptions.uri}');
    print('│ 📛 Message: ${err.message}');
    print('└─────────────────────────────────────────────────────────');
    handler.next(err);
  }
}
