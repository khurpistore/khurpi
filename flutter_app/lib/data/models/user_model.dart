import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    super.name,
    required super.phone,
    super.email,
    super.address,
    super.city,
    super.pincode,
    super.isAdmin,
    super.wholesaleEnabled,
    super.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'],
      phone: json['phone'] ?? '',
      email: json['email'],
      address: json['address'],
      city: json['city'],
      pincode: json['pincode'],
      isAdmin: json['is_admin'] ?? false,
      wholesaleEnabled: json['wholesale_enabled'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'address': address,
      'city': city,
      'pincode': pincode,
      'is_admin': isAdmin,
      'wholesale_enabled': wholesaleEnabled,
    };
  }

  UserEntity toEntity() => this;
}
