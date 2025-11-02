import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    // On mobile (Android/iOS/macOS/Windows), if firebase config files are present
    // (GoogleService-Info.plist / google-services.json), this is sufficient.
    // For Web/Desktop without config files, we'll wire DefaultFirebaseOptions later.
    await Firebase.initializeApp();
  } catch (_) {
    // Allow app to run even if Firebase isn't configured yet (for initial scaffolding)
  }
  runApp(const ProviderScope(child: App()));
}
