import 'package:flutter/material.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';

/// Full-screen error state for connectivity / configuration problems.
/// Use [AppErrorView.noInternet] when API calls fail with a network/socket error,
/// and [AppErrorView.config] when the backend URL / config is missing or invalid.
class AppErrorView extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final VoidCallback? onRetry;

  const AppErrorView({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.onRetry,
  });

  factory AppErrorView.noInternet({VoidCallback? onRetry}) => AppErrorView(
        icon: Icons.wifi_off_rounded,
        title: 'No Internet Connection',
        message: 'Please check your connection and try again.',
        onRetry: onRetry,
      );

  factory AppErrorView.config({VoidCallback? onRetry}) => AppErrorView(
        icon: Icons.settings_suggest_rounded,
        title: 'Something Went Wrong',
        message:
            'We are unable to reach the server right now. Please try again in a moment.',
        onRetry: onRetry,
      );

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 56, color: AppColors.primary),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A1A2E),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600, height: 1.4),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 28),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                label: const Text('Try Again', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
