import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/features/main_navigation_page.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class OTPLoginPage extends ConsumerStatefulWidget {
  const OTPLoginPage({super.key});

  @override
  ConsumerState<OTPLoginPage> createState() => _OTPLoginPageState();
}

class _OTPLoginPageState extends ConsumerState<OTPLoginPage> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _nameController = TextEditingController();
  final _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
  
  bool _isLoading = false;
  bool _otpSent = false;
  bool _isNewUser = false;
  String? _errorMessage;
  String? _debugOtp; // For testing

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    
    if (phone.length != 10) {
      setState(() => _errorMessage = 'Please enter a valid 10-digit phone number');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _dio.post('/auth/send-otp', data: {'phone': phone});
      
      if (response.data['success'] == true) {
        setState(() {
          _otpSent = true;
          _debugOtp = response.data['debug_otp']; // For testing
        });
        
        // Show debug OTP in snackbar for testing
        if (_debugOtp != null && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Test OTP: $_debugOtp'),
              duration: const Duration(seconds: 10),
              backgroundColor: AppColors.primary,
            ),
          );
        }
      } else {
        setState(() => _errorMessage = response.data['message'] ?? 'Failed to send OTP');
      }
    } on DioException catch (e) {
      setState(() => _errorMessage = e.response?.data?['detail'] ?? 'Network error');
    } catch (e) {
      setState(() => _errorMessage = 'Something went wrong');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final phone = _phoneController.text.trim();
    final otp = _otpController.text.trim();
    
    if (otp.length != 6) {
      setState(() => _errorMessage = 'Please enter the 6-digit OTP');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = {
        'phone': phone,
        'otp': otp,
        'name': _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : null,
      };
      
      final response = await _dio.post('/auth/verify-otp', data: data);
      
      if (response.data['success'] == true) {
        final isNew = response.data['is_new_user'] == true;
        
        if (isNew && _nameController.text.trim().isEmpty) {
          // Ask for name
          setState(() => _isNewUser = true);
        } else {
          // Save user and navigate
          final user = response.data['user'];
          await ref.read(provideAuthViewModelNotifierProvider)?.loginWithUserData(user);
          
          if (mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const MainNavigationPage()),
              (route) => false,
            );
          }
        }
      } else {
        setState(() => _errorMessage = response.data['message'] ?? 'Verification failed');
      }
    } on DioException catch (e) {
      setState(() => _errorMessage = e.response?.data?['detail'] ?? 'Network error');
    } catch (e) {
      setState(() => _errorMessage = 'Something went wrong');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _resendOtp() {
    _otpController.clear();
    _sendOtp();
  }

  void _changeNumber() {
    setState(() {
      _otpSent = false;
      _isNewUser = false;
      _otpController.clear();
      _nameController.clear();
      _errorMessage = null;
      _debugOtp = null;
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Center(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _otpSent ? Icons.sms : Icons.phone_android,
                    size: 48,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              // Title
              Text(
                _isNewUser
                    ? 'Welcome!'
                    : _otpSent
                        ? 'Verify OTP'
                        : 'Login with Phone',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              
              // Subtitle
              Text(
                _isNewUser
                    ? 'Please enter your name to complete registration'
                    : _otpSent
                        ? 'Enter the 6-digit code sent to\n+91 ${_phoneController.text}'
                        : 'We will send you a verification code',
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 40),

              // Phone Input
              if (!_otpSent) ...[
                Text(
                  'Phone Number',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                        decoration: BoxDecoration(
                          border: Border(
                            right: BorderSide(color: AppColors.border),
                          ),
                        ),
                        child: const Text(
                          '+91',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          maxLength: 10,
                          style: const TextStyle(fontSize: 16, letterSpacing: 1),
                          decoration: const InputDecoration(
                            hintText: 'Enter phone number',
                            border: InputBorder.none,
                            counterText: '',
                            contentPadding: EdgeInsets.symmetric(horizontal: 16),
                          ),
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // OTP Input
              if (_otpSent && !_isNewUser) ...[
                PinCodeTextField(
                  appContext: context,
                  length: 6,
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  animationType: AnimationType.fade,
                  pinTheme: PinTheme(
                    shape: PinCodeFieldShape.box,
                    borderRadius: BorderRadius.circular(12),
                    fieldHeight: 56,
                    fieldWidth: 48,
                    activeFillColor: Colors.white,
                    inactiveFillColor: AppColors.background,
                    selectedFillColor: AppColors.primary.withOpacity(0.1),
                    activeColor: AppColors.primary,
                    inactiveColor: AppColors.border,
                    selectedColor: AppColors.primary,
                  ),
                  enableActiveFill: true,
                  onCompleted: (_) => _verifyOtp(),
                  onChanged: (_) {},
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Didn't receive code? ",
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                    TextButton(
                      onPressed: _isLoading ? null : _resendOtp,
                      child: const Text(
                        'Resend',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: _changeNumber,
                  child: const Text('Change phone number'),
                ),
              ],

              // Name Input for new users
              if (_isNewUser) ...[
                Text(
                  'Your Name',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: InputDecoration(
                    hintText: 'Enter your name',
                    prefixIcon: const Icon(Icons.person_outline),
                    filled: true,
                    fillColor: AppColors.background,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: AppColors.border),
                    ),
                  ),
                ),
              ],

              // Error Message
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: AppColors.error, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(color: AppColors.error, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 32),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading
                      ? null
                      : _isNewUser
                          ? _verifyOtp
                          : _otpSent
                              ? _verifyOtp
                              : _sendOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          _isNewUser
                              ? 'Complete Registration'
                              : _otpSent
                                  ? 'Verify OTP'
                                  : 'Send OTP',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 24),

              // Terms
              Center(
                child: Text(
                  'By continuing, you agree to our Terms of Service\nand Privacy Policy',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
