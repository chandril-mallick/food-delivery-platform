import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      children: const [
        Card(
          child: ListTile(
            title: Text('Taxes & Delivery Charges'),
            subtitle: Text('Configure tax rates, delivery fees, and free delivery thresholds.'),
          ),
        ),
        Card(
          child: ListTile(
            title: Text('Promo Codes & Offers'),
            subtitle: Text('Create and manage discounts, vouchers, and campaigns.'),
          ),
        ),
        Card(
          child: ListTile(
            title: Text('Localization'),
            subtitle: Text('Multi-language and multi-currency settings.'),
          ),
        ),
        Card(
          child: ListTile(
            title: Text('Appearance'),
            subtitle: Text('Dark/Light mode toggle and theme settings.'),
          ),
        ),
      ],
    );
  }
}
