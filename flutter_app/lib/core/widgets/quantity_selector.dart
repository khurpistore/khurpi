import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

class QuantitySelector extends StatelessWidget {
  final double quantity;
  final String unit;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final bool compact;

  const QuantitySelector({
    super.key,
    required this.quantity,
    required this.unit,
    required this.onIncrement,
    required this.onDecrement,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return _buildCompact();
    }
    return _buildFull();
  }

  Widget _buildCompact() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildButton(Icons.remove, onDecrement, isLeft: true),
          Container(
            constraints: const BoxConstraints(minWidth: 40),
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              _formatQuantity(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          _buildButton(Icons.add, onIncrement, isLeft: false),
        ],
      ),
    );
  }

  Widget _buildFull() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.primary),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Decrement Button
          InkWell(
            onTap: onDecrement,
            borderRadius: const BorderRadius.horizontal(
              left: Radius.circular(11),
            ),
            child: Container(
              padding: const EdgeInsets.all(12),
              child: const Icon(
                Icons.remove,
                color: AppColors.primary,
                size: 20,
              ),
            ),
          ),
          
          // Quantity Display
          Container(
            constraints: const BoxConstraints(minWidth: 60),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _getQuantityValue(),
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  unit,
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          
          // Increment Button
          InkWell(
            onTap: onIncrement,
            borderRadius: const BorderRadius.horizontal(
              right: Radius.circular(11),
            ),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.horizontal(
                  right: Radius.circular(11),
                ),
              ),
              child: const Icon(
                Icons.add,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildButton(IconData icon, VoidCallback onTap, {required bool isLeft}) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Icon(
          icon,
          color: Colors.white,
          size: 16,
        ),
      ),
    );
  }

  String _formatQuantity() {
    if (unit == 'gm') {
      return '${quantity.toInt()}g';
    }
    return '${quantity}kg';
  }

  String _getQuantityValue() {
    if (unit == 'gm') {
      return '${quantity.toInt()}';
    }
    return quantity.toString();
  }
}
