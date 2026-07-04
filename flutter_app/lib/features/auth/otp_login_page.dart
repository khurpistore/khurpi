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
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeMSG91();
  }

  void _initializeMSG91() {
    try {
      OTPWidget.initializeWidget(_widgetId, _authToken);
      setState(() => _isInitialized = true);
      debugPrint('MSG91 OTP Widget initialized successfully');
    } catch (e) {
      debugPrint('MSG91 initialization error: $e');
      setState(() => _errorMessage = 'Failed to initialize OTP service');
    }
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    
    if (phone.length != 10) {
      setState(() => _errorMessage = 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!_isInitialized) {
      _initializeMSG91();
      if (!_isInitialized) {
        setState(() => _errorMessage = 'OTP service not ready. Please try again.');
        return;
      }
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Send OTP via MSG91 Widget SDK
      // identifier must contain country code without + (e.g., 91XXXXXXXXXX)
      final data = {
        'identifier': '91$phone',
      };
      
      debugPrint('Sending OTP to: 91$phone');
      final response = await OTPWidget.sendOTP(data);
      debugPrint('MSG91 sendOTP response: $response');
      
      // Response format: {type: "success/error", message: "reqId or error message"}
      if (response != null && response['type'] == 'success') {
        setState(() {
          _otpSent = true;
          _reqId = response['message']; // reqId is in message field on success
        });
        _startResendTimer();
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('OTP sent successfully!'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          );
        }
      } else {
        final errorMsg = response?['message'] ?? 'Failed to send OTP';
        setState(() => _errorMessage = errorMsg);
        debugPrint('Send OTP failed: $errorMsg');
      }
    } catch (e) {
      debugPrint('Send OTP exception: $e');
      setState(() => _errorMessage = 'Failed to send OTP. Please check your connection.');
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
        'reqId': _reqId!,
        'otp': otp,
      };
      
      debugPrint('Verifying OTP with reqId: $_reqId');
      final response = await OTPWidget.verifyOTP(data);
      debugPrint('MSG91 verifyOTP response: $response');
      
      if (response != null && response['type'] == 'success') {
        // OTP verified successfully
        // Extract access token if available for server-side verification
        final accessToken = response['accessToken'] ?? response['access_token'] ?? response['message'];
        
        await _handleSuccessfulVerification(accessToken: accessToken);
      } else {
        final errorMsg = response?['message'] ?? 'Invalid OTP. Please try again.';
        setState(() => _errorMessage = errorMsg);
      }
    } catch (e) {
      debugPrint('Verify OTP exception: $e');
      setState(() => _errorMessage = 'Verification failed. Please try again.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSuccessfulVerification({String? accessToken}) async {
    final phone = _phoneController.text.trim();
    final name = _nameController.text.trim();
    
    try {
      // Call our backend to create/fetch user after MSG91 verification
      final response = await _dio.post('/auth/otp-verified', data: {
        'phone': phone,
        'name': name.isNotEmpty ? name : null,
        'access_token': accessToken,
      });
      
      debugPrint('Backend auth response: ${response.data}');
      
      if (response.data['success'] == true) {
        final isNew = response.data['is_new_user'] == true;
        
        if (isNew && name.isEmpty) {
          // New user needs to provide name
          setState(() => _isNewUser = true);
        } else {
          // Save user and navigate to home
          final user = response.data['user'];
          await ref.read(provideAuthViewModelNotifierProvider)?.loginWithUserData(user);
          
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(isNew ? 'Welcome to Khurpi Fresh!' : 'Welcome back!'),
                backgroundColor: AppColors.success,
              ),
            );
            
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
    } on DioException catch (e) {
      debugPrint('Backend auth error: ${e.response?.data}');
      setState(() => _errorMessage = e.response?.data?['detail'] ?? 'Server error. Please try again.');
    } catch (e) {
      debugPrint('Backend auth exception: $e');
      setState(() => _errorMessage = 'Something went wrong. Please try again.');
    }
  }

  Future<void> _retryOtp({int? channel}) async {
    if (_reqId == null || _resendTimer > 0) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // retryChannel codes: SMS-11, VOICE-4, EMAIL-3, WHATSAPP-12
      final data = <String, dynamic>{
        'reqId': _reqId!,
      };
      
      if (channel != null) {
        data['retryChannel'] = channel;
      }
      
      debugPrint('Retrying OTP with channel: $channel');
      final response = await OTPWidget.retryOTP(data);
      debugPrint('MSG91 retryOTP response: $response');
      
      if (response != null && response['type'] == 'success') {
        _startResendTimer();
        if (mounted) {
          String channelName = 'SMS';
          if (channel == 4) channelName = 'Voice Call';
          if (channel == 12) channelName = 'WhatsApp';
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('OTP sent via $channelName'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      } else {
        setState(() => _errorMessage = response?['message'] ?? 'Failed to resend OTP');
      }
    } catch (e) {
      debugPrint('Retry OTP exception: $e');
      setState(() => _errorMessage = 'Failed to resend OTP');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _startResendTimer() {
    setState(() => _resendTimer = 30);
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
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              
              // Header Icon
              Center(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.primary.withOpacity(0.15),
                        AppColors.secondary.withOpacity(0.1),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _isNewUser 
                        ? Icons.person_add_rounded 
                        : _otpSent 
                            ? Icons.lock_clock_rounded 
                            : Icons.phone_android_rounded,
                    size: 52,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 36),
              
              // Title
              Text(
                _isNewUser
                    ? 'Almost there!'
                    : _otpSent
                        ? 'Verify OTP'
                        : 'Welcome',
                style: const TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 10),
              
              // Subtitle
              Text(
                _isNewUser
                    ? 'Enter your name to complete registration'
                    : _otpSent
                        ? 'We sent a 6-digit code to\n+91 ${_phoneController.text}'
                        : 'Enter your phone number to continue',
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 40),

              // Phone Input
              if (!_otpSent) ...[
                _buildLabel('Phone Number'),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border, width: 1.5),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.08),
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(14),
                            bottomLeft: Radius.circular(14),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(2),
                              child: Image.network(
                                'https://flagcdn.com/w40/in.png',
                                width: 24,
                                height: 18,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  width: 24,
                                  height: 18,
                                  color: Colors.orange,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              '+91',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(width: 1.5, height: 56, color: AppColors.border),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          maxLength: 10,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 2,
                          ),
                          decoration: const InputDecoration(
                            hintText: '98765 43210',
                            hintStyle: TextStyle(
                              color: AppColors.textHint,
                              letterSpacing: 2,
                            ),
                            border: InputBorder.none,
                            counterText: '',
                            contentPadding: EdgeInsets.symmetric(horizontal: 18),
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
                  animationType: AnimationType.scale,
                  animationDuration: const Duration(milliseconds: 200),
                  pinTheme: PinTheme(
                    shape: PinCodeFieldShape.box,
                    borderRadius: BorderRadius.circular(14),
                    fieldHeight: 60,
                    fieldWidth: 50,
                    activeFillColor: Colors.white,
                    inactiveFillColor: AppColors.background,
                    selectedFillColor: AppColors.primary.withOpacity(0.08),
                    activeColor: AppColors.primary,
                    inactiveColor: AppColors.border,
                    selectedColor: AppColors.primary,
                    borderWidth: 1.5,
                  ),
                  enableActiveFill: true,
                  onCompleted: (_) => _verifyOtp(),
                  onChanged: (_) {
                    if (_errorMessage != null) {
                      setState(() => _errorMessage = null);
                    }
                  },
                ),
                const SizedBox(height: 24),
                
                // Resend Options
                Center(
                  child: Column(
                    children: [
                      if (_resendTimer > 0)
                        Text(
                          'Resend OTP in ${_resendTimer}s',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        )
                      else
                        Column(
                          children: [
                            const Text(
                              "Didn't receive the code?",
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                _buildRetryButton(Icons.sms_outlined, 'SMS', () => _retryOtp(channel: 11)),
                                const SizedBox(width: 12),
                                _buildRetryButton(Icons.call_outlined, 'Call', () => _retryOtp(channel: 4)),
                                const SizedBox(width: 12),
                                _buildRetryButton(Icons.chat_outlined, 'WhatsApp', () => _retryOtp(channel: 12)),
                              ],
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: TextButton.icon(
                    onPressed: _changeNumber,
                    icon: const Icon(Icons.edit, size: 18),
                    label: const Text('Change phone number'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                    ),
                  ),
                ),
              ],

              // Name Input for new users
              if (_isNewUser) ...[
                _buildLabel('Your Name'),
                const SizedBox(height: 10),
                TextField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  style: const TextStyle(fontSize: 16),
                  decoration: InputDecoration(
                    hintText: 'Enter your full name',
                    prefixIcon: const Icon(Icons.person_outline_rounded),
                    filled: true,
                    fillColor: AppColors.background,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: AppColors.border, width: 1.5),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: AppColors.border, width: 1.5),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                ),
              ],

              // Error Message
              if (_errorMessage != null) ...[
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.error.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline_rounded, color: AppColors.error, size: 22),
                      const SizedBox(width: 10),
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

              const SizedBox(height: 36),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 56,
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
                    disabledBackgroundColor: AppColors.primary.withOpacity(0.6),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          _isNewUser
                              ? 'Continue'
                              : _otpSent
                                  ? 'Verify & Login'
                                  : 'Get OTP',
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.3,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 28),

              // Terms
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'By continuing, you agree to our Terms of Service and Privacy Policy',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textHint,
                      height: 1.5,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildRetryButton(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: _isLoading ? null : onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: AppColors.primary),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
