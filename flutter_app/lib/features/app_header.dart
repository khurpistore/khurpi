import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/features/address/address_providers.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/core/widgets/app_search_bar.dart';
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
    // Address on the home header comes ONLY from the address API (selected/default
    // address), never from the cached getUser() profile address.
    final userAddress = addressState.displayAddress;
    final hasAddress = userAddress != null && userAddress.trim().isNotEmpty;
    final isLoggedIn = user != null;
    
    // App name from config or default
    final appName = appConfig?.appName ?? 'Khurpi Fresh';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 3),
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
                              color: AppColors.primary.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              hasAddress ? Icons.location_on : Icons.eco,
                              color: AppColors.primary,
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
                                          Text(
                                            'Deliver to',
                                            style: TextStyle(
                                              color: AppColors.textSecondary,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          Icon(
                                            Icons.keyboard_arrow_down,
                                            color: AppColors.textSecondary,
                                            size: 16,
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        userAddress ?? 'Set location',
                                        style: TextStyle(
                                          color: AppColors.textPrimary,
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
                                        style: TextStyle(
                                          color: AppColors.textPrimary,
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
                                                color: AppColors.textSecondary,
                                                fontSize: 12,
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            Icon(
                                              Icons.add_circle_outline,
                                              color: AppColors.primary,
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

                  const SizedBox(width: 16),
                  // Account Button (Cart removed - shown at bottom of screen)
                  GestureDetector(
                    onTap: onAccountTap,
                    child: Container(
                      padding: const EdgeInsets.all(9),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        isLoggedIn ? Icons.person : Icons.person_outline,
                        color: AppColors.primary,
                        size: 22,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Row 2: Search Bar (shared widget)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: AppSearchBar(onTap: onSearchTap),
            ),
          ],
        ),
      ),
      ),
    );
  }
}
