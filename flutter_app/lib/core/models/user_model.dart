class UserModel {
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

  UserModel({
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

  String get displayName => name ?? phone;
  
  String get fullAddress {
    final parts = <String>[];
    if (address != null && address!.isNotEmpty) parts.add(address!);
    if (city != null && city!.isNotEmpty) parts.add(city!);
    if (pincode != null && pincode!.isNotEmpty) parts.add(pincode!);
    return parts.join(', ');
  }
}
