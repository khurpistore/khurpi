import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/providers.dart';


// Prize model for wheel sections
class WheelPrize {
  final String name;
  final String? productId;
  final double quantity;
  final String unit;
  final String? imageUrl;
  final Color color;
  final bool isEmpty;

  const WheelPrize({
    required this.name,
    this.productId,
    this.quantity = 0,
    this.unit = 'g',
    this.imageUrl,
    required this.color,
    this.isEmpty = false,
  });
}

// Default prizes for the wheel
const List<WheelPrize> defaultPrizes = [
  WheelPrize(
    name: 'Tomato',
    productId: 'spin_tomato',
    quantity: 250,
    unit: 'g',
    color: Color(0xFFE53935),
  ),
  WheelPrize(
    name: 'Better Luck!',
    color: Color(0xFF9E9E9E),
    isEmpty: true,
  ),
  WheelPrize(
    name: 'Spinach',
    productId: 'spin_spinach',
    quantity: 100,
    unit: 'g',
    color: Color(0xFF43A047),
  ),
  WheelPrize(
    name: 'Carrot',
    productId: 'spin_carrot',
    quantity: 200,
    unit: 'g',
    color: Color(0xFFFF9800),
  ),
  WheelPrize(
    name: 'Onion',
    productId: 'spin_onion',
    quantity: 250,
    unit: 'g',
    color: Color(0xFF8E24AA),
  ),
  WheelPrize(
    name: 'Potato',
    productId: 'spin_potato',
    quantity: 500,
    unit: 'g',
    color: Color(0xFF795548),
  ),
];

class SpinWheelWidget extends ConsumerStatefulWidget {
  final List<WheelPrize> prizes;
  
  const SpinWheelWidget({
    super.key,
    this.prizes = defaultPrizes,
  });

  @override
  ConsumerState<SpinWheelWidget> createState() => _SpinWheelWidgetState();
}

class _SpinWheelWidgetState extends ConsumerState<SpinWheelWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  
  double _currentRotation = 0;
  bool _isSpinning = false;
  bool _canSpin = true;
  WheelPrize? _wonPrize;
  bool _showResult = false;

  static const String _spinKey = 'last_spin_order_id';

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );
    
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCirc,
    );
    
    _animation.addListener(() {
      setState(() {});
    });
    
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _onSpinComplete();
      }
    });
    
    _checkSpinEligibility();
  }

  Future<void> _checkSpinEligibility() async {
    final prefs = ref.read(sharedPreferencesProvider);
    final lastSpinOrderId = prefs.getString(_spinKey);
    
    // User can spin if they haven't spun yet (null) or if they've completed an order
    // For simplicity, we'll check if cart is empty and they've spun before
    final cartState = ref.read(provideCartViewModelProvider);
    
    // If user has spun before and cart is not empty, they can't spin again
    // They can spin again after completing an order (cart becomes empty)
    if (lastSpinOrderId != null && lastSpinOrderId == 'pending') {
      setState(() => _canSpin = false);
    } else {
      setState(() => _canSpin = cartState != null);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _spin() {
    if (_isSpinning || !_canSpin) return;

    setState(() {
      _isSpinning = true;
      _showResult = false;
      _wonPrize = null;
    });

    // Random number of full rotations (3-5) plus random segment
    final random = Random();
    final fullRotations = 3 + random.nextInt(3);
    final randomAngle = random.nextDouble() * 2 * pi;
    final totalRotation = fullRotations * 2 * pi + randomAngle;

    _currentRotation = totalRotation;
    _controller.reset();
    _controller.forward();
  }

  void _onSpinComplete() async {
    // Calculate which prize was won based on final rotation
    final normalizedAngle = (_currentRotation % (2 * pi));
    final sectionAngle = (2 * pi) / widget.prizes.length;
    
    // The pointer is at the top (12 o'clock), so we need to adjust
    // Add pi/2 to account for the pointer position and reverse direction
    final adjustedAngle = (2 * pi - normalizedAngle + pi / 2) % (2 * pi);
    final prizeIndex = (adjustedAngle / sectionAngle).floor() % widget.prizes.length;
    
    final prize = widget.prizes[prizeIndex];
    
    setState(() {
      _isSpinning = false;
      _wonPrize = prize;
      _showResult = true;
    });

    // Mark as spun (pending order completion)
    final prefs = ref.read(sharedPreferencesProvider);
    await prefs.setString(_spinKey, 'pending');
    
    setState(() => _canSpin = false);

    // If won a prize (not empty), add to cart
    if (!prize.isEmpty) {
      _addPrizeToCart(prize);
    }
  }

  void _addPrizeToCart(WheelPrize prize) {
    ref.read(provideCartViewModelNotifierProvider)?.addFreeItem(
      productId: prize.productId!,
      productName: '🎁 FREE ${prize.name}',
      quantity: prize.quantity / 1000, // Convert g to kg
      unit: 'kg',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.secondary.withOpacity(0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          // Title
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.auto_awesome, color: AppColors.secondary, size: 24),
              const SizedBox(width: 8),
              Text(
                'Spin & Win Free Veggies!',
                style: AppTextStyles.h4.copyWith(color: AppColors.primary),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.auto_awesome, color: AppColors.secondary, size: 24),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _canSpin 
                ? 'Spin once before placing your order!'
                : 'Complete an order to spin again',
            style: AppTextStyles.caption.copyWith(
              color: _canSpin ? AppColors.textSecondary : AppColors.error,
            ),
          ),
          const SizedBox(height: 20),
          
          // Wheel
          SizedBox(
            height: 280,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Wheel
                Transform.rotate(
                  angle: _animation.value * _currentRotation,
                  child: CustomPaint(
                    size: const Size(250, 250),
                    painter: WheelPainter(prizes: widget.prizes),
                  ),
                ),
                
                // Center button
                GestureDetector(
                  onTap: _canSpin && !_isSpinning ? _spin : null,
                  child: Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: _canSpin && !_isSpinning
                            ? [AppColors.primary, AppColors.primaryDark]
                            : [Colors.grey.shade400, Colors.grey.shade600],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (_canSpin ? AppColors.primary : Colors.grey).withOpacity(0.4),
                          blurRadius: 10,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Center(
                      child: _isSpinning
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 3,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Text(
                              'SPIN',
                              style: AppTextStyles.body.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                    ),
                  ),
                ),
                
                // Pointer at top
                Positioned(
                  top: 0,
                  child: CustomPaint(
                    size: const Size(30, 30),
                    painter: PointerPainter(),
                  ),
                ),
              ],
            ),
          ),
          
          // Result
          if (_showResult && _wonPrize != null)
            AnimatedOpacity(
              opacity: _showResult ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 300),
              child: Container(
                margin: const EdgeInsets.only(top: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _wonPrize!.isEmpty 
                      ? Colors.grey.shade100 
                      : AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _wonPrize!.isEmpty 
                        ? Colors.grey.shade300 
                        : AppColors.success.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _wonPrize!.isEmpty ? Icons.sentiment_neutral : Icons.celebration,
                      color: _wonPrize!.isEmpty ? Colors.grey : AppColors.success,
                      size: 28,
                    ),
                    const SizedBox(width: 12),
                    Flexible(
                      child: Text(
                        _wonPrize!.isEmpty
                            ? 'Better luck next time!'
                            : '🎉 You won ${_wonPrize!.quantity.toInt()}${_wonPrize!.unit} ${_wonPrize!.name} FREE!',
                        style: AppTextStyles.body.copyWith(
                          fontWeight: FontWeight.w600,
                          color: _wonPrize!.isEmpty ? Colors.grey.shade600 : AppColors.success,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// Custom painter for the wheel
class WheelPainter extends CustomPainter {
  final List<WheelPrize> prizes;

  WheelPainter({required this.prizes});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final sectionAngle = (2 * pi) / prizes.length;

    for (int i = 0; i < prizes.length; i++) {
      final startAngle = i * sectionAngle - pi / 2;
      final prize = prizes[i];

      // Draw section
      final paint = Paint()
        ..color = prize.color
        ..style = PaintingStyle.fill;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sectionAngle,
        true,
        paint,
      );

      // Draw border
      final borderPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sectionAngle,
        true,
        borderPaint,
      );

      // Draw text
      canvas.save();
      canvas.translate(center.dx, center.dy);
      canvas.rotate(startAngle + sectionAngle / 2);

      final textPainter = TextPainter(
        text: TextSpan(
          text: prize.isEmpty 
              ? '😢' 
              : '${prize.name}\n${prize.quantity.toInt()}${prize.unit}',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.bold,
            shadows: [
              Shadow(color: Colors.black54, blurRadius: 2, offset: Offset(1, 1)),
            ],
          ),
        ),
        textDirection: TextDirection.ltr,
        textAlign: TextAlign.center,
      );
      textPainter.layout();

      final textOffset = Offset(
        radius * 0.55 - textPainter.width / 2,
        -textPainter.height / 2,
      );
      textPainter.paint(canvas, textOffset);

      canvas.restore();
    }

    // Draw outer ring
    final outerRingPaint = Paint()
      ..color = AppColors.primaryDark
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6;
    canvas.drawCircle(center, radius, outerRingPaint);
    
    // Draw decorative dots
    for (int i = 0; i < prizes.length; i++) {
      final angle = i * sectionAngle - pi / 2;
      final dotX = center.dx + (radius - 3) * cos(angle);
      final dotY = center.dy + (radius - 3) * sin(angle);
      
      final dotPaint = Paint()..color = Colors.white;
      canvas.drawCircle(Offset(dotX, dotY), 5, dotPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom painter for the pointer
class PointerPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    path.moveTo(size.width / 2, size.height);
    path.lineTo(0, 0);
    path.lineTo(size.width, 0);
    path.close();

    final paint = Paint()
      ..color = AppColors.secondary
      ..style = PaintingStyle.fill;

    final shadowPaint = Paint()
      ..color = Colors.black26
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);

    canvas.drawPath(path.shift(const Offset(2, 2)), shadowPaint);
    canvas.drawPath(path, paint);

    // Border
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawPath(path, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
