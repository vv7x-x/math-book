import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api.dart';

class DashboardScreen extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final VoidCallback onToggleLang;
  const DashboardScreen({super.key, required this.onToggleTheme, required this.onToggleLang});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _student;
  List<dynamic> _lessons = [];
  List<dynamic> _ann = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('student');
    if (raw == null) { if (!mounted) return; Navigator.of(context).pushReplacementNamed('/'); return; }
    final student = jsonDecode(raw) as Map<String, dynamic>;
    setState(() { _student = student; });
    final lessons = await Api.getLessons();
    final ann = await Api.getAnnouncements();
    setState(() { _lessons = lessons; _ann = ann; });
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('student');
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed('/');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة الطالب'),
        actions: [
          IconButton(onPressed: widget.onToggleLang, icon: const Icon(Icons.language)),
          IconButton(onPressed: widget.onToggleTheme, icon: const Icon(Icons.brightness_6)),
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout)),
        ],
      ),
      body: _student == null ? const Center(child: CircularProgressIndicator()) : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton.icon(onPressed: () => Navigator.of(context).pushNamed('/qr'), icon: const Icon(Icons.qr_code), label: const Text('QR')),
                ElevatedButton.icon(onPressed: () => Navigator.of(context).pushNamed('/announcements'), icon: const Icon(Icons.campaign), label: const Text('الإعلانات')),
                ElevatedButton.icon(onPressed: () => Navigator.of(context).pushNamed('/teacher-news'), icon: const Icon(Icons.school), label: const Text('أخبار')),
              ],
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_student!['fullName'] ?? '', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 200,
                      child: Center(
                        child: Image.network(Api.qrUrl(_student!['id']), height: 180),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text('جدول الدروس', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ..._lessons.map((l) => Card(child: ListTile(title: Text(l['subject'] ?? ''), subtitle: Text('${DateTime.fromMillisecondsSinceEpoch(l['date']).toLocal()} – ${l['center']}')))),
            const SizedBox(height: 12),
            Text('إعلانات المعلم', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ..._ann.map((a) => Card(child: ListTile(title: Text(a['title'] ?? ''), subtitle: Text(a['message'] ?? '')))),
          ],
        ),
      ),
    );
  }
}

