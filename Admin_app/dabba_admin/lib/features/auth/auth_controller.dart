import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AdminRole { admin, restaurantManager, deliveryManager, unknown }

class AuthState {
  final fb.User? user;
  final AdminRole role;
  final bool loading;

  const AuthState({required this.user, required this.role, required this.loading});

  AuthState copyWith({fb.User? user, AdminRole? role, bool? loading}) => AuthState(
        user: user ?? this.user,
        role: role ?? this.role,
        loading: loading ?? this.loading,
      );

  static const unauthenticated = AuthState(user: null, role: AdminRole.unknown, loading: false);
}

class AuthController extends AsyncNotifier<AuthState> {
  late final fb.FirebaseAuth _auth;
  late final FirebaseFirestore _db;
  StreamSubscription? _sub;

  @override
  Future<AuthState> build() async {
    try {
      _auth = fb.FirebaseAuth.instance;
      _db = FirebaseFirestore.instance;
    } catch (_) {
      // Firebase not initialized (e.g., in tests). Return unauthenticated state.
      return AuthState.unauthenticated;
    }

    final completer = Completer<AuthState>();

    _sub = _auth.authStateChanges().listen((fb.User? user) async {
      final role = await _resolveRole(user);
      state = AsyncData(AuthState(user: user, role: role, loading: false));
      if (!completer.isCompleted) completer.complete(state.value!);
    }, onError: (e, st) {
      state = AsyncError(e, st);
      if (!completer.isCompleted) completer.completeError(e, st);
    });

    // Ensure subscription is cleaned when provider is disposed
    ref.onDispose(() {
      _sub?.cancel();
    });

    return completer.future;
  }

  Future<AdminRole> _resolveRole(fb.User? user) async {
    if (user == null) return AdminRole.unknown;

    try {
      // Try custom claim first
      final idTokenResult = await user.getIdTokenResult(true);
      final claim = idTokenResult.claims?['role'] as String?;
      if (claim != null) {
        return _mapRole(claim);
      }
    } catch (_) {}

    try {
      // Fallback to Firestore users/{uid}.role
      final doc = await _db.collection('users').doc(user.uid).get();
      final data = doc.data();
      if (data != null && data['role'] is String) {
        return _mapRole(data['role']);
      }
    } catch (_) {}

    // Temporary dev fallback: email-based heuristic to unblock UI
    final email = user.email ?? '';
    if (email.contains('admin')) return AdminRole.admin;
    if (email.contains('manager')) return AdminRole.restaurantManager;

    return AdminRole.unknown;
  }

  AdminRole _mapRole(String role) {
    switch (role) {
      case 'admin':
        return AdminRole.admin;
      case 'restaurant_manager':
      case 'restaurantManager':
        return AdminRole.restaurantManager;
      case 'delivery_manager':
      case 'deliveryManager':
        return AdminRole.deliveryManager;
      default:
        return AdminRole.unknown;
    }
  }

  Future<void> signOut() async {
    try {
      await fb.FirebaseAuth.instance.signOut();
    } catch (_) {}
  }
}

final authControllerProvider = AsyncNotifierProvider<AuthController, AuthState>(
  AuthController.new,
);
