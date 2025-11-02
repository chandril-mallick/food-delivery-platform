import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../router.dart';

class AdminShell extends ConsumerWidget {
  const AdminShell({super.key, required this.child});
  final Widget child;

  static const _destinations = [
    _NavDest('Dashboard', Icons.dashboard, '/'),
    _NavDest('Orders', Icons.receipt_long, '/orders'),
    _NavDest('Menu', Icons.restaurant_menu, '/menu'),
    _NavDest('Restaurants', Icons.store_mall_directory, '/restaurants'),
    _NavDest('Delivery', Icons.delivery_dining, '/delivery'),
    _NavDest('Customers', Icons.people_alt, '/customers'),
    _NavDest('Payments', Icons.payments, '/payments'),
    _NavDest('Analytics', Icons.insights, '/analytics'),
    _NavDest('Settings', Icons.settings, '/settings'),
    _NavDest('Notifications', Icons.notifications_active, '/notifications'),
  ];

  int _indexForLocation(String location) {
    final idx = _destinations.indexWhere((d) => d.route == location);
    return idx >= 0 ? idx : 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).uri.toString();
    final selected = _indexForLocation(location);
    final width = MediaQuery.sizeOf(context).width;
    final isMobile = width < 800;
    final useExtendedRail = width >= 1100;

    return Scaffold(
      appBar: AppBar(
        leading: isMobile
            ? Builder(
                builder: (context) => IconButton(
                  icon: const Icon(Icons.menu),
                  onPressed: () => Scaffold.of(context).openDrawer(),
                ),
              )
            : null,
        title: Text(_destinations[selected].label),
        actions: [
          IconButton(
            tooltip: 'Toggle theme',
            onPressed: () {},
            icon: const Icon(Icons.brightness_6),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: () {
              final bypass = ref.read(devBypassAuthProvider);
              if (bypass) {
                ref.read(devBypassAuthProvider.notifier).state = false;
              } else {
                // Could call a central signOut here via a top-level action
              }
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      drawer: isMobile
          ? Drawer(
              child: SafeArea(
                child: ListView(
                  children: [
                    const ListTile(
                      title: Text('Dabba Admin'),
                      subtitle: Text('Navigation'),
                    ),
                    const Divider(),
                    for (var i = 0; i < _destinations.length; i++)
                      ListTile(
                        leading: Icon(_destinations[i].icon),
                        title: Text(_destinations[i].label),
                        selected: selected == i,
                        onTap: () {
                          Navigator.of(context).pop();
                          final route = _destinations[i].route;
                          if (route != location) context.go(route);
                        },
                      ),
                  ],
                ),
              ),
            )
          : null,
      body: Row(
        children: [
          if (!isMobile) ...[
            NavigationRail(
              selectedIndex: selected,
              extended: useExtendedRail,
              labelType: useExtendedRail ? null : NavigationRailLabelType.selected,
              destinations: [
                for (final d in _destinations)
                  NavigationRailDestination(
                    icon: Icon(d.icon),
                    label: Text(d.label),
                  )
              ],
              onDestinationSelected: (idx) {
                final route = _destinations[idx].route;
                if (route != location) context.go(route);
              },
            ),
            const VerticalDivider(width: 1),
          ],
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: child,
            ),
          ),
        ],
      ),
      bottomNavigationBar: isMobile
          ? NavigationBar(
              selectedIndex: selected,
              onDestinationSelected: (idx) {
                final route = _destinations[idx].route;
                if (route != location) context.go(route);
              },
              destinations: [
                for (final d in _destinations)
                  NavigationDestination(
                    icon: Icon(d.icon),
                    label: d.label,
                  )
              ],
            )
          : null,
    );
  }
}

class _NavDest {
  final String label;
  final IconData icon;
  final String route;
  const _NavDest(this.label, this.icon, this.route);
}
