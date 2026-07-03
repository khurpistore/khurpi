import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';
import 'package:khurpi_fresh/data/models/auth_response_model.dart';

part '../../generated/data/api/auth_api_service.g.dart';

@RestApi()
abstract class AuthApiService {
  factory AuthApiService(Dio dio, {String baseUrl}) = _AuthApiService;

  @POST('/auth/login')
  Future<AuthResponseModel> login(@Body() LoginRequest request);

  @POST('/auth/register')
  Future<AuthResponseModel> register(@Body() RegisterRequest request);

  @GET('/auth/me')
  Future<UserModel> getCurrentUser();

  @PUT('/auth/profile')
  Future<UserModel> updateProfile(@Body() UpdateProfileRequest request);
}
