import 'package:flutter/material.dart';

class ThemeToggle extends StatelessWidget {
  final VoidCallback onToggleTheme;
  final VoidCallback onToggleLang;
  const ThemeToggle({super.key, required this.onToggleTheme, required this.onToggleLang});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(onPressed: onToggleLang, icon: const Icon(Icons.language)),
        IconButton(onPressed: onToggleTheme, icon: const Icon(Icons.brightness_6)),
      ],
    );
  }
}

