import 'package:flutter/material.dart';
import '../services/database_service.dart';
import '../models/announcement_model.dart';

class TeacherNewsScreen extends StatefulWidget {
  const TeacherNewsScreen({super.key});
  @override
  State<TeacherNewsScreen> createState() => _TeacherNewsScreenState();
}

class _TeacherNewsScreenState extends State<TeacherNewsScreen> {
  List<AnnouncementModel> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final items = await DatabaseService.getAnnouncements();
    setState(() { _items = items; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('أخبار المعلم')),
      body: _loading ? const Center(child: CircularProgressIndicator()) : ListView.builder(
        itemCount: _items.length,
        itemBuilder: (ctx, i) {
          final a = _items[i];
          return ListTile(title: Text(a.title), subtitle: Text(a.message));
        },
      ),
    );
  }
}

