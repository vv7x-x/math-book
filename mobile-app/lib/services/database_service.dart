import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/lesson_model.dart';
import '../models/announcement_model.dart';
import 'api.dart';

class DatabaseService {
  static Future<List<LessonModel>> getLessons() async {
    final res = await http.get(Uri.parse('${Api.base}/api/lessons'));
    if (res.statusCode != 200) return [];
    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => LessonModel.fromMap(e)).toList();
  }

  static Future<List<AnnouncementModel>> getAnnouncements() async {
    final res = await http.get(Uri.parse('${Api.base}/api/announcements'));
    if (res.statusCode != 200) return [];
    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => AnnouncementModel.fromMap(e)).toList();
  }
}

