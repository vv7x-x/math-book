import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final VoidCallback onToggleLang;
  const LoginScreen({super.key, required this.onToggleTheme, required this.onToggleLang});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _username = TextEditingController();
  String? _error;
  bool _loading = false;

  Future<void> _login() async {
    setState(() { _loading = true; _error = null; });
    try {
      final student = await Api.login(_username.text.trim());
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('student', student);
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/dashboard');
    } catch (e) {
      setState(() { _error = 'لم يتم اعتماد الحساب بعد أو اسم المستخدم غير صحيح'; });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('بوابة الطالب'),
        actions: [
          IconButton(onPressed: widget.onToggleLang, icon: const Icon(Icons.language)),
          IconButton(onPressed: widget.onToggleTheme, icon: const Icon(Icons.brightness_6)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(controller: _username, decoration: const InputDecoration(labelText: 'اسم المستخدم')),            
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _loading ? null : _login, child: _loading ? const CircularProgressIndicator() : const Text('دخول')),
            const SizedBox(height: 8),
            OutlinedButton(onPressed: () => Navigator.of(context).pushNamed('/register'), child: const Text('تسجيل حساب')),
            if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: const TextStyle(color: Colors.red)))
          ],
        ),
      ),
    );
  }
}

