import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'features/auth/login_page.dart';
import 'features/dashboard/dashboard_page.dart';
import 'features/auth/auth_controller.dart';
import 'features/shell/admin_shell.dart';
import 'features/orders/orders_page.dart';
import 'features/menu/menu_page.dart';
import 'features/restaurants/restaurants_page.dart';
import 'features/delivery/delivery_page.dart';
import 'features/customers/customers_page.dart';
import 'features/payments/payments_page.dart';
import 'features/analytics/analytics_page.dart';
import 'features/settings/settings_page.dart';
import 'features/notifications/notifications_page.dart';

// Temporary dev bypass until Firebase Auth is configured on this app
final devBypassAuthProvider = StateProvider<bool>((ref) => false);

final appRouterProvider = Provider<GoRouter>((ref) {
  final authAsync = ref.watch(authControllerProvider);
  final devBypass = ref.watch(devBypassAuthProvider);

  bool isAuthenticated = false;
  authAsync.whenOrNull(
    data: (auth) => isAuthenticated = auth.user != null,
  );
  isAuthenticated = isAuthenticated || devBypass;

  return GoRouter(
    initialLocation: isAuthenticated ? '/' : '/login',
    refreshListenable: Listenable.merge([
      // Trigger refresh on auth changes
      // Using ValueNotifier wrapper to satisfy GoRouter API
      ValueNotifier(isAuthenticated),
    ]),
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => AdminShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: '/orders',
            name: 'orders',
            builder: (context, state) => const OrdersPage(),
          ),
          GoRoute(
            path: '/menu',
            name: 'menu',
            builder: (context, state) => const MenuPage(),
          ),
          GoRoute(
            path: '/restaurants',
            name: 'restaurants',
            builder: (context, state) => const RestaurantsPage(),
          ),
          GoRoute(
            path: '/delivery',
            name: 'delivery',
            builder: (context, state) => const DeliveryPage(),
          ),
          GoRoute(
            path: '/customers',
            name: 'customers',
            builder: (context, state) => const CustomersPage(),
          ),
          GoRoute(
            path: '/payments',
            name: 'payments',
            builder: (context, state) => const PaymentsPage(),
          ),
          GoRoute(
            path: '/analytics',
            name: 'analytics',
            builder: (context, state) => const AnalyticsPage(),
          ),
          GoRoute(
            path: '/settings',
            name: 'settings',
            builder: (context, state) => const SettingsPage(),
          ),
          GoRoute(
            path: '/notifications',
            name: 'notifications',
            builder: (context, state) => const NotificationsPage(),
          ),
        ],
      ),
    ],
    redirect: (context, state) {
      final goingToLogin = state.matchedLocation == '/login';
      if (!isAuthenticated && !goingToLogin) return '/login';
      if (isAuthenticated && goingToLogin) return '/';
      return null;
    },
  );
});
