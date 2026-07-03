import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/cart_item_model.freezed.dart';
part '../../generated/data/models/cart_item_model.g.dart';

@freezed
abstract class CartItemModel with _$CartItemModel {
  const factory CartItemModel({
    required String productId,
    required String productName,
    required double price,
    double? wholesalePrice,
    String? imageUrl,
    required double quantity,
    @Default('kg') String unit,
  }) = _CartItemModel;

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);

  static CartItemModel initial() {
    return const CartItemModel(
      productId: '',
      productName: '',
      price: 0,
      quantity: 0,
    );
  }
}

extension CartItemModelX on CartItemModel {
  double get totalPrice => price * quantity;
}
