# Khurpi Fresh Flutter App - Setup Instructions

## Prerequisites
- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio or VS Code with Flutter extensions
- An Android emulator or physical device

## Quick Start

```bash
# Navigate to the Flutter project
cd flutter_app

# Get dependencies
flutter pub get

# Run the analyzer to check for issues
flutter analyze

# Run on connected device/emulator
flutter run
```

## Expected Behavior After `flutter pub get`

Most analyzer errors you saw (like "Target of URI doesn't exist") will disappear after running `flutter pub get` because:
- `dartz` package will be downloaded
- `equatable` package will be downloaded  
- `flutter_riverpod` package will be downloaded
- All other dependencies will be resolved

## Optional: Add Custom Fonts

1. Download Poppins font from https://fonts.google.com/specimen/Poppins
2. Copy the following files to `assets/fonts/`:
   - Poppins-Regular.ttf
   - Poppins-Medium.ttf
   - Poppins-SemiBold.ttf
   - Poppins-Bold.ttf
3. Uncomment the `fonts` section in `pubspec.yaml`
4. Update `fontFamily: 'Roboto'` to `fontFamily: 'Poppins'` in `lib/main.dart`

## Project Structure

```
lib/
├── core/           # Core utilities, constants, network client
├── data/           # Data layer (models, datasources, repository implementations)
├── domain/         # Domain layer (entities, repository interfaces, use cases)
├── presentation/   # UI layer (pages, widgets, viewmodels, providers)
└── main.dart       # App entry point
```

## Architecture
- **Clean Architecture** with 3 layers (Domain, Data, Presentation)
- **Riverpod** for state management
- **MVVM pattern** with ViewModels

## API Configuration

The API base URL is configured in `lib/core/constants/app_constants.dart`. 
Update `baseUrl` to point to your backend server.

## Troubleshooting

### Error: "Target of URI doesn't exist"
Run `flutter pub get` to download all dependencies.

### Error: "asset directory doesn't exist"
The `assets/images/` directory has been created. Add your images there.

### Error: Font files not found
Fonts are optional. The app will use Roboto as fallback.
