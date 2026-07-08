import 'package:flutter/material.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';

/// Shared search bar used across the app (home header + search page) so the
/// look & feel stays identical everywhere.
///
/// - Read-only mode (home header): pass [onTap]; it shows the hint and taps
///   navigate to the search page.
/// - Editable mode (search page): pass a [controller]; it becomes a real input.
class AppSearchBar extends StatelessWidget {
  final VoidCallback? onTap;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final ValueChanged<String>? onChanged;
  final String hintText;
  final bool autofocus;
  final VoidCallback? onClear;

  const AppSearchBar({
    super.key,
    this.onTap,
    this.controller,
    this.focusNode,
    this.onChanged,
    this.hintText = 'Search vegetables, fruits & more',
    this.autofocus = false,
    this.onClear,
  });

  bool get _editable => controller != null;

  @override
  Widget build(BuildContext context) {
    final showClear = _editable && (controller?.text.isNotEmpty ?? false);

    final content = Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.primary.withOpacity(0.18)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.search_rounded, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _editable
                ? TextField(
                    controller: controller,
                    focusNode: focusNode,
                    autofocus: autofocus,
                    onChanged: onChanged,
                    style: TextStyle(fontSize: 14, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      isDense: true,
                      border: InputBorder.none,
                      hintText: hintText,
                      hintStyle: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    child: Text(
                      hintText,
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ),
          ),
          if (showClear)
            GestureDetector(
              onTap: onClear,
              child: Icon(Icons.close_rounded, color: AppColors.textSecondary, size: 20),
            ),
        ],
      ),
    );

    if (_editable) return content;
    return GestureDetector(onTap: onTap, child: content);
  }
}
