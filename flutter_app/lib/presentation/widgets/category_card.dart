import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../domain/entities/category_entity.dart';

class CategoryCard extends StatelessWidget {
  final CategoryEntity category;
  final bool isSelected;
  final VoidCallback onTap;

  const CategoryCard({
    super.key,
    required this.category,
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        margin: const EdgeInsets.only(right: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.background,
                borderRadius: BorderRadius.circular(16),
                border: isSelected ? Border.all(color: AppColors.primary, width: 2) : null,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: category.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: category.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => _buildPlaceholder(),
                        errorWidget: (context, url, error) => _buildIcon(),
                      )
                    : _buildIcon(),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              category.name,
              style: AppTextStyles.caption.copyWith(
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.background,
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
    );
  }

  Widget _buildIcon() {
    return Container(
      color: AppColors.background,
      child: Icon(_getCategoryIcon(), color: isSelected ? AppColors.primary : AppColors.textHint, size: 28),
    );
  }

  IconData _getCategoryIcon() {
    switch (category.name.toLowerCase()) {
      case 'vegetables':
        return Icons.eco;
      case 'fruits':
        return Icons.apple;
      case 'leafy greens':
        return Icons.grass;
      case 'root vegetables':
        return Icons.landscape;
      case 'exotic & imported':
        return Icons.star;
      case 'microgreens':
        return Icons.spa;
      default:
        return Icons.category;
    }
  }
}
