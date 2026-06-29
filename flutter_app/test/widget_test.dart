import 'package:flutter_test/flutter_test.dart';
import 'package:khurpi_fresh/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const KhurpiFreshApp());

    // Verify the app starts without crashing
    expect(find.text('Khurpi Fresh'), findsOneWidget);
  });
}
