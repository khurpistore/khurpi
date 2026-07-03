import 'package:flutter/material.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/features/spin_wheel_widget.dart';

class EarnPage extends StatelessWidget {
  const EarnPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.stars_rounded, color: AppColors.secondary, size: 28),
                  const SizedBox(width: 10),
                  Text(
                    'Earn & Win',
                    style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                  ),
                  const SizedBox(width: 10),
                  const Icon(Icons.stars_rounded, color: AppColors.secondary, size: 28),
                ],
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Add items to cart and spin to win free veggies!',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            const SpinWheelWidget(),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('How it works', style: AppTextStyles.h4),
                    const SizedBox(height: 12),
                    _HowItWorksStep(
                      icon: Icons.shopping_cart_outlined,
                      step: '1',
                      text: 'Add items to your cart',
                    ),
                    _HowItWorksStep(
                      icon: Icons.autorenew,
                      step: '2',
                      text: 'Come here and spin the wheel',
                    ),
                    _HowItWorksStep(
                      icon: Icons.card_giftcard,
                      step: '3',
                      text: 'Win FREE vegetables added to your cart!',
                    ),
                    _HowItWorksStep(
                      icon: Icons.local_shipping_outlined,
                      step: '4',
                      text: 'Place your order and enjoy',
                      isLast: true,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _HowItWorksStep extends StatelessWidget {
  final IconData icon;
  final String step;
  final String text;
  final bool isLast;

  const _HowItWorksStep({
    required this.icon,
    required this.step,
    required this.text,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                step,
                style: TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: AppTextStyles.body),
          ),
        ],
      ),
    );
  }
}

