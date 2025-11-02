import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router.dart';

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Dabba Admin',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        // Brighter vivid orange palette
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFFF6A00)),
        useMaterial3: true,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFFF6A00),
          foregroundColor: Colors.white,
          centerTitle: false,
          elevation: 0,
        ),
        navigationBarTheme: NavigationBarThemeData(
          indicatorColor: const Color(0x1AFF6A00),
          iconTheme: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return const IconThemeData(color: Color(0xFFFF6A00));
            }
            return const IconThemeData(color: Colors.black87);
          }),
          labelTextStyle: MaterialStateProperty.resolveWith((states) {
            final color = states.contains(MaterialState.selected)
                ? const Color(0xFFFF6A00)
                : Colors.black87;
            return TextStyle(fontWeight: FontWeight.w600, color: color);
          }),
        ),
        navigationRailTheme: const NavigationRailThemeData(
          selectedIconTheme: IconThemeData(color: Color(0xFFFF6A00)),
          selectedLabelTextStyle: TextStyle(
            color: Color(0xFFFF6A00),
            fontWeight: FontWeight.w700,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF6A00),
            foregroundColor: Colors.white,
          ),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: Color(0xFFFF6A00),
          foregroundColor: Colors.white,
        ),
        chipTheme: ChipThemeData(
          selectedColor: const Color(0x1AFF6A00),
          labelStyle: const TextStyle(fontWeight: FontWeight.w600),
          side: const BorderSide(color: Color(0x33FF6A00)),
          showCheckmark: false,
        ),
        cardTheme: CardThemeData(
          elevation: 1,
          surfaceTintColor: const Color(0xFFFF6A00).withOpacity(0.08),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFFF6A00), width: 2),
          ),
        ),
        checkboxTheme: CheckboxThemeData(
          fillColor: MaterialStateProperty.resolveWith((states) => const Color(0xFFFF6A00)),
        ),
        radioTheme: RadioThemeData(
          fillColor: MaterialStateProperty.resolveWith((states) => const Color(0xFFFF6A00)),
        ),
        switchTheme: SwitchThemeData(
          trackColor: MaterialStateProperty.resolveWith((states) => const Color(0x33FF6A00)),
          thumbColor: MaterialStateProperty.resolveWith((states) => const Color(0xFFFF6A00)),
        ),
        progressIndicatorTheme: const ProgressIndicatorThemeData(
          color: Color(0xFFFF6A00),
        ),
        tabBarTheme: const TabBarThemeData(
          labelColor: Color(0xFFFF6A00),
          indicatorColor: Color(0xFFFF6A00),
          unselectedLabelColor: Colors.black54,
        ),
        listTileTheme: const ListTileThemeData(
          selectedColor: Color(0xFFFF6A00),
          iconColor: Colors.black87,
        ),
        snackBarTheme: const SnackBarThemeData(
          backgroundColor: Colors.black87,
          actionTextColor: Color(0xFFFF6A00),
          contentTextStyle: TextStyle(color: Colors.white),
        ),
        dividerTheme: const DividerThemeData(
          color: Color(0x1AFF6A00),
        ),
        dialogTheme: DialogThemeData(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          // Keep the same bright seed but adapt to dark mode
          seedColor: const Color(0xFFFF6A00),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        appBarTheme: AppBarTheme(
          backgroundColor: const Color(0xFFFF6A00).withOpacity(0.15),
          foregroundColor: Colors.white,
          centerTitle: false,
          elevation: 0,
        ),
        navigationBarTheme: NavigationBarThemeData(
          indicatorColor: const Color(0x33FF6A00),
          iconTheme: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return const IconThemeData(color: Color(0xFFFF8A33));
            }
            return const IconThemeData(color: Colors.white70);
          }),
          labelTextStyle: MaterialStateProperty.resolveWith((states) {
            final color = states.contains(MaterialState.selected)
                ? const Color(0xFFFF8A33)
                : Colors.white70;
            return TextStyle(fontWeight: FontWeight.w600, color: color);
          }),
        ),
        navigationRailTheme: const NavigationRailThemeData(
          selectedIconTheme: IconThemeData(color: Color(0xFFFF8A33)),
          selectedLabelTextStyle: TextStyle(
            color: Color(0xFFFF8A33),
            fontWeight: FontWeight.w700,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF6A00),
            foregroundColor: Colors.white,
          ),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: Color(0xFFFF6A00),
          foregroundColor: Colors.white,
        ),
        chipTheme: ChipThemeData(
          selectedColor: const Color(0x33FF6A00),
          labelStyle: const TextStyle(fontWeight: FontWeight.w600),
          side: const BorderSide(color: Color(0x33FF6A00)),
          showCheckmark: false,
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          surfaceTintColor: const Color(0xFFFF6A00).withOpacity(0.12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFFF8A33), width: 2),
          ),
        ),
        checkboxTheme: CheckboxThemeData(
          fillColor: MaterialStateProperty.resolveWith((states) => const Color(0xFFFF8A33)),
        ),
        radioTheme: RadioThemeData(
          fillColor: MaterialStateProperty.resolveWith((states) => const Color(0xFFFF8A33)),
        ),
        switchTheme: SwitchThemeData(
          trackColor: MaterialStateProperty.resolveWith((states) => const Color(0x33FF6A00)),
          thumbColor: MaterialStateProperty.resolveWith((states) => const Color(0xFFFF8A33)),
        ),
        progressIndicatorTheme: const ProgressIndicatorThemeData(
          color: Color(0xFFFF8A33),
        ),
        tabBarTheme: const TabBarThemeData(
          labelColor: Color(0xFFFF8A33),
          indicatorColor: Color(0xFFFF8A33),
          unselectedLabelColor: Colors.white70,
        ),
        listTileTheme: const ListTileThemeData(
          selectedColor: Color(0xFFFF8A33),
          iconColor: Colors.white70,
        ),
        snackBarTheme: const SnackBarThemeData(
          backgroundColor: Color(0xFF1F1F1F),
          actionTextColor: Color(0xFFFF8A33),
          contentTextStyle: TextStyle(color: Colors.white),
        ),
        dividerTheme: const DividerThemeData(
          color: Color(0x33FF6A00),
        ),
        dialogTheme: DialogThemeData(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      routerConfig: router,
    );
  }
}
