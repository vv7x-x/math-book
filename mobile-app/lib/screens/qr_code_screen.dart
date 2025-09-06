import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api.dart';

class QrCodeScreen extends StatefulWidget {
  const QrCodeScreen({super.key});
  @override
  State<QrCodeScreen> createState() => _QrCodeScreenState();
}

class _QrCodeScreenState extends State<QrCodeScreen> {
  String? _id;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('student');
    if (raw == null) return;
    final map = jsonDecode(raw) as Map<String, dynamic>;
    setState(() { _id = map['id']; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('كود الحضور')),
      body: Center(
        child: _id == null ? const CircularProgressIndicator() : Image.network(Api.qrUrl(_id!)),
      ),
    );
  }
}

