class AppConstants {
  // API Base URL - Update this with your production URL
  static const String baseUrl = 'https://khurpistore.in/api';
  
  // App Info
  static const String appName = 'Khurpi Fresh';
  static const String appTagline = 'Fresh Vegetables & Fruits';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String cartKey = 'cart_data';
  static const String locationKey = 'user_location';
  
  // Pagination
  static const int pageSize = 20;
  
  // Default Values
  static const String defaultCurrency = '₹';
  static const String defaultUnit = 'kg';
  
  // Delivery
  static const double freeDeliveryThreshold = 500.0;
  static const double standardDeliveryFee = 40.0;
}
