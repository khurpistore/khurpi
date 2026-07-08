import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/features/address/address_providers.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/splash/splash_page.dart';

class AppHeader extends ConsumerWidget {
  final VoidCallback? onSearchTap;
  final VoidCallback? onAddressTap;
  final VoidCallback? onAccountTap;

  const AppHeader({
    super.key,
    this.onSearchTap,
    this.onAddressTap,
    this.onAccountTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(provideAuthViewModelProvider);
    final appConfig = ref.watch(appConfigProvider);
    final addressState = ref.watch(addressNotifierProvider);
    
    final user = authState?.user;
    final userAddress = addressState.displayAddress ?? user?.formattedAddress ?? user?.addressLine1 ?? user?.address;
    final hasAddress = userAddress != null && userAddress.trim().isNotEmpty;
    final isLoggedIn = user != null;
    
    // App name from config or default
    final appName = appConfig?.appName ?? 'Khurpi Fresh';

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Row 1: Location/App Name + Cart + Account
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
              child: Row(
                children: [
                  // Delivery Location OR App Name
                  Expanded(
                    child: GestureDetector(
                      onTap: onAddressTap,
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              hasAddress ? Icons.location_on : Icons.eco,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: hasAddress
                                ? Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Text(
                                            'Deliver to',
                                            style: TextStyle(
                                              color: Colors.white70,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Icon(
                                            Icons.keyboard_arrow_down,
                                            color: Colors.white70,
                                            size: 16,
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        userAddress ?? 'Set location',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 14,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  )
                                : Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        appName,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      GestureDetector(
                                        onTap: onAddressTap,
                                        child: Row(
                                          children: [
                                            Text(
                                              'Set delivery location',
                                              style: TextStyle(
                                                color: Colors.white.withOpacity(0.8),
                                                fontSize: 12,
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            Icon(
                                              Icons.add_circle_outline,
                                              color: Colors.white.withOpacity(0.8),
                                              size: 14,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Account Button (Cart removed - shown at bottom of screen)
                  GestureDetector(
                    onTap: onAccountTap,
                    child: Container(
                      padding: const EdgeInsets.all(10),

                      child: Icon(
                        isLoggedIn ? Icons.person : Icons.person_outline,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Row 2: Search Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
              child: GestureDetector(
                onTap: onSearchTap,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.10),
                        blurRadius: 18,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.search_rounded, color: AppColors.primary, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Search vegetables, fruits & more',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                      Icon(Icons.tune_rounded, color: AppColors.textHint, size: 20),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
