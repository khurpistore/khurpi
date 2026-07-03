import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sendotp_flutter_sdk/sendotp_flutter_sdk.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/features/main_navigation_page.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';

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
  
  // MSG91 Widget Configuration
  static const String _widgetId = '366179704b55353730393234';
  static const String _authToken = '490446Ty29Y53gM69764e27P1';
  
  bool _isLoading = false;
  bool _otpSent = false;
  bool _isNewUser = false;
  String? _errorMessage;
  String? _reqId; // MSG91 request ID for verification
  int _resendTimer = 0;

  @override
  void initState() {
    super.initState();
    _initializeMSG91();
  }

  void _initializeMSG91() {
    try {
      OTPWidget.initializeWidget(_widgetId, _authToken);
      debugPrint('MSG91 Widget initialized');
    } catch (e) {
      debugPrint('MSG91 initialization error: $e');
    }
  }

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
      // Send OTP via MSG91 Widget SDK
      final data = {
        'identifier': '91$phone', // Country code + phone without +
      };
      
      final response = await OTPWidget.sendOTP(data);
      debugPrint('MSG91 sendOTP response: $response');
      
      if (response != null && response['type'] == 'success') {
        setState(() {
          _otpSent = true;
          _reqId = response['message']; // reqId is returned in message field
          _startResendTimer();
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('OTP sent successfully!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        setState(() => _errorMessage = response?['message'] ?? 'Failed to send OTP');
      }
    } catch (e) {
      debugPrint('Send OTP error: $e');
      setState(() => _errorMessage = 'Failed to send OTP. Please try again.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    
    if (otp.length != 6) {
      setState(() => _errorMessage = 'Please enter the 6-digit OTP');
      return;
    }

    if (_reqId == null) {
      setState(() => _errorMessage = 'Session expired. Please request OTP again.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Verify OTP via MSG91 Widget SDK
      final data = {
        'reqId': _reqId,
        'otp': otp,
      };
      
      final response = await OTPWidget.verifyOTP(data);
      debugPrint('MSG91 verifyOTP response: $response');
      
      if (response != null && response['type'] == 'success') {
        // OTP verified, now create/login user in our backend
        await _handleSuccessfulVerification();
      } else {
        setState(() => _errorMessage = response?['message'] ?? 'Invalid OTP. Please try again.');
      }
    } catch (e) {
      debugPrint('Verify OTP error: $e');
      setState(() => _errorMessage = 'Verification failed. Please try again.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSuccessfulVerification() async {
    final phone = _phoneController.text.trim();
    final name = _nameController.text.trim();
    
    try {
      // Call our backend to create/fetch user after MSG91 verification
      final response = await _dio.post('/auth/otp-verified', data: {
        'phone': phone,
        'name': name.isNotEmpty ? name : null,
      });
      
      if (response.data['success'] == true) {
        final isNew = response.data['is_new_user'] == true;
        
        if (isNew && name.isEmpty) {
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
        setState(() => _errorMessage = response.data['message'] ?? 'Login failed');
      }
    } catch (e) {
      debugPrint('Backend auth error: $e');
      setState(() => _errorMessage = 'Server error. Please try again.');
    }
  }

  Future<void> _retryOtp({int? channel}) async {
    if (_reqId == null || _resendTimer > 0) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = {
        'reqId': _reqId,
        if (channel != null) 'retryChannel': channel,
      };
      
      final response = await OTPWidget.retryOTP(data);
      debugPrint('MSG91 retryOTP response: $response');
      
      if (response != null && response['type'] == 'success') {
        _startResendTimer();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('OTP resent successfully!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        setState(() => _errorMessage = response?['message'] ?? 'Failed to resend OTP');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to resend OTP');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _startResendTimer() {
    _resendTimer = 30;
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted && _resendTimer > 0) {
        setState(() => _resendTimer--);
        return true;
      }
      return false;
    });
  }

  void _changeNumber() {
    setState(() {
      _otpSent = false;
      _isNewUser = false;
      _otpController.clear();
      _nameController.clear();
      _errorMessage = null;
      _reqId = null;
      _resendTimer = 0;
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
                    gradient: LinearGradient(
                      colors: [
                        AppColors.primary.withOpacity(0.1),
                        AppColors.secondary.withOpacity(0.1),
                      ],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _otpSent ? Icons.sms_outlined : Icons.phone_android,
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
                        : 'We will send you a verification code via SMS',
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
                          color: AppColors.primary.withOpacity(0.05),
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(13),
                            bottomLeft: Radius.circular(13),
                          ),
                        ),
                        child: Row(
                          children: [
                            Image.network(
                              'https://flagcdn.com/w20/in.png',
                              width: 20,
                              height: 15,
                              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              '+91',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(width: 1, height: 50, color: AppColors.border),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          maxLength: 10,
                          style: const TextStyle(fontSize: 16, letterSpacing: 1.5),
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
                const SizedBox(height: 20),
                
                // Resend Options
                Center(
                  child: Column(
                    children: [
                      if (_resendTimer > 0)
                        Text(
                          'Resend OTP in ${_resendTimer}s',
                          style: TextStyle(color: AppColors.textSecondary),
                        )
                      else
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            TextButton.icon(
                              onPressed: () => _retryOtp(channel: 11),
                              icon: const Icon(Icons.sms, size: 18),
                              label: const Text('SMS'),
                            ),
                            const Text('|', style: TextStyle(color: AppColors.border)),
                            TextButton.icon(
                              onPressed: () => _retryOtp(channel: 4),
                              icon: const Icon(Icons.call, size: 18),
                              label: const Text('Call'),
                            ),
                            const Text('|', style: TextStyle(color: AppColors.border)),
                            TextButton.icon(
                              onPressed: () => _retryOtp(channel: 12),
                              icon: const Icon(Icons.chat, size: 18),
                              label: const Text('WhatsApp'),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: TextButton(
                    onPressed: _changeNumber,
                    child: const Text('Change phone number'),
                  ),
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
                    border: Border.all(color: AppColors.error.withOpacity(0.3)),
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
                          ? _handleSuccessfulVerification
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
