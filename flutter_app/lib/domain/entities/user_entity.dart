import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String? name;
  final String phone;
  final String? email;
  final String? address;
  final String? city;
  final String? pincode;
  final bool isAdmin;
  final bool wholesaleEnabled;
  final DateTime? createdAt;

  const UserEntity({
    required this.id,
    this.name,
    required this.phone,
    this.email,
    this.address,
    this.city,
    this.pincode,
    this.isAdmin = false,
    this.wholesaleEnabled = false,
    this.createdAt,
  });

  String get displayName => name ?? phone;
  
  String get fullAddress {
    final parts = <String>[];
    if (address != null && address!.isNotEmpty) parts.add(address!);
    if (city != null && city!.isNotEmpty) parts.add(city!);
    if (pincode != null && pincode!.isNotEmpty) parts.add(pincode!);
    return parts.join(', ');
  }

  @override
  List<Object?> get props => [
        id, name, phone, email, address, city, pincode,
        isAdmin, wholesaleEnabled, createdAt,
      ];
}
