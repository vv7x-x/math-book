import 'dart:convert';
import 'package:http/http.dart' as http;

class Api {
  static String base = const String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:4000');
  static String get _api => '$base/api';

  static Future<String> login(String username) async {
    final res = await http.post(Uri.parse('$_api/login'), headers: {'Content-Type': 'application/json'}, body: jsonEncode({'username': username}));
    if (res.statusCode != 200) {
      throw Exception('login failed');
    }
    return jsonEncode(jsonDecode(res.body)['student']);
  }

  static Future<void> register(Map<String, String> data) async {
    final res = await http.post(Uri.parse('$_api/register'), headers: {'Content-Type': 'application/json'}, body: jsonEncode(data));
    if (res.statusCode != 200) {
      throw Exception('register failed');
    }
  }

  static Future<List<String>> getCenters() async {
    final res = await http.get(Uri.parse('$_api/centers'));
    if (res.statusCode != 200) return [];
    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => e['name'] as String).toList();
  }

  static Future<List<dynamic>> getLessons() async {
    final res = await http.get(Uri.parse('$_api/lessons'));
    if (res.statusCode != 200) return [];
    return jsonDecode(res.body) as List<dynamic>;
  }

  static Future<List<dynamic>> getAnnouncements() async {
    final res = await http.get(Uri.parse('$_api/announcements'));
    if (res.statusCode != 200) return [];
    return jsonDecode(res.body) as List<dynamic>;
  }

  static String qrUrl(String id) => '$_api/students/$id/qr';
}

