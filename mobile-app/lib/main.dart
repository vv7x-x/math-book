import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/registration_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/qr_code_screen.dart';
import 'screens/announcements_screen.dart';
import 'screens/teacher_news_screen.dart';
import 'services/notification_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  NotificationService.init();
  runApp(const SpecialOneApp());
}

class SpecialOneApp extends StatefulWidget {
  const SpecialOneApp({super.key});

  @override
  State<SpecialOneApp> createState() => _SpecialOneAppState();
}

class _SpecialOneAppState extends State<SpecialOneApp> {
  ThemeMode _mode = ThemeMode.light;
  Locale _locale = const Locale('ar');

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _mode = (prefs.getString('theme') == 'dark') ? ThemeMode.dark : ThemeMode.light;
      _locale = Locale(prefs.getString('lang') ?? 'ar');
    });
  }

  void _toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _mode = _mode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
    await prefs.setString('theme', _mode == ThemeMode.dark ? 'dark' : 'light');
  }

  void _toggleLang() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _locale = _locale.languageCode == 'ar' ? const Locale('en') : const Locale('ar');
    });
    await prefs.setString('lang', _locale.languageCode);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Special One',
      themeMode: _mode,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E88E5)),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      darkTheme: ThemeData.dark(useMaterial3: true),
      locale: _locale,
      routes: {
        '/': (ctx) => LoginScreen(onToggleTheme: _toggleTheme, onToggleLang: _toggleLang),
        '/registration': (ctx) => const RegistrationScreen(),
        '/dashboard': (ctx) => DashboardScreen(onToggleTheme: _toggleTheme, onToggleLang: _toggleLang),
        '/qr': (ctx) => const QrCodeScreen(),
        '/announcements': (ctx) => const AnnouncementsScreen(),
        '/teacher-news': (ctx) => const TeacherNewsScreen(),
      },
    );
  }
}

