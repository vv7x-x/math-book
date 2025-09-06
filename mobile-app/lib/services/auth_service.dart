import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api.dart';

class AuthService {
  static Future<Map<String, dynamic>> login(String username) async {
    final raw = await Api.login(username);
    final map = jsonDecode(raw) as Map<String, dynamic>;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('student', raw);
    return map;
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('student');
  }
}

