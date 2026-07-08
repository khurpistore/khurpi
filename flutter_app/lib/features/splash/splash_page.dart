import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/features/main_navigation_page.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/home/home_providers.dart';
import 'package:khurpi_fresh/data/models/app_config_model.dart';

// Global app config provider
final appConfigProvider = StateProvider<AppConfigModel?>((ref) => null);

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  
  String _appName = 'Khurpi Fresh';
  String _tagline = 'Fresh from Farm to Table';
  String _loadingText = 'Loading...';

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(milliseconds: 1500), vsync: this);
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _controller, curve: const Interval(0, 0.5)));
    _scaleAnimation = Tween<double>(begin: 0.5, end: 1).animate(CurvedAnimation(parent: _controller, curve: Curves.elasticOut));
    _controller.forward();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initApp();
    });
  }

  Future<void> _initApp() async {
    try {
      // Step 1: Fetch app configuration
      setState(() => _loadingText = 'Fetching configuration...');
      await _fetchAppConfig();
      
      // Step 2: Initialize auth (auto login)
      setState(() => _loadingText = 'Checking session...');
      await ref.read(provideAuthViewModelNotifierProvider)?.initialize();
      
      // Step 3: Load cart
      setState(() => _loadingText = 'Loading cart...');
      await ref.read(provideCartViewModelNotifierProvider)?.loadCart();
      
      // Step 4: Pre-load home data
      setState(() => _loadingText = 'Almost ready...');
      await Future.wait<void>([
        ref.read(provideStoreViewModelNotifierProvider)?.loadStoreSettings() ?? Future.value(),
        Future.delayed(const Duration(milliseconds: 500)),
      ]);
      
    } catch (e) {
      debugPrint('Error initializing app: $e');
    }

    if (mounted) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const MainNavigationPage(),
          transitionsBuilder: (_, animation, __, child) => FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    }
  }

  Future<void> _fetchAppConfig() async {
    try {
      final dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
      final response = await dio.get('/config');
      
      if (response.data != null) {
        final config = AppConfigModel.fromJson(response.data);
        AppColors.applyConfig(config);
        AppTextStyles.applyConfig(config);
        ref.read(appConfigProvider.notifier).state = config;
        
        setState(() {
          _appName = config.appName;
          _tagline = config.appTagline;
        });
      }
    } catch (e) {
      debugPrint('Error fetching config: $e');
      // Use defaults on error
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.primary, AppColors.primaryDark],
          ),
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Opacity(
                opacity: _fadeAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo
                      Container(
                        padding: const EdgeInsets.all(28),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.eco, size: 80, color: Colors.white),
                      ),
                      const SizedBox(height: 32),
                      
                      // App Name
                      Text(
                        _appName,
                        style: const TextStyle(
                          fontSize: 38,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      // Tagline
                      Text(
                        _tagline,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white.withOpacity(0.9),
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 60),
                      
                      // Loading indicator
                      const SizedBox(
                        width: 36,
                        height: 36,
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          strokeWidth: 3,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Loading text
                      Text(
                        _loadingText,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
