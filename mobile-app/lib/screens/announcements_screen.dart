import 'package:flutter/material.dart';
import '../services/database_service.dart';
import '../models/announcement_model.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({super.key});
  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
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
      appBar: AppBar(title: const Text('الإعلانات')),
      body: _loading ? const Center(child: CircularProgressIndicator()) : ListView.builder(
        itemCount: _items.length,
        itemBuilder: (ctx, i) {
          final a = _items[i];
          return Card(
            child: ListTile(
              title: Text(a.title),
              subtitle: Text(a.message),
              trailing: Text(DateTime.fromMillisecondsSinceEpoch(a.createdAt).toLocal().toString().split('.').first),
            ),
          );
        },
      ),
    );
  }
}

