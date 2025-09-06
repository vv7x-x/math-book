import 'package:flutter/material.dart';
import '../services/api.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, String> _data = {};
  List<String> _centers = [];
  String? _msg;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadCenters();
  }

  Future<void> _loadCenters() async {
    final centers = await Api.getCenters();
    setState(() { _centers = centers; });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    setState(() { _loading = true; _msg = null; });
    try {
      await Api.register(_data);
      setState(() { _msg = 'تم إرسال طلبك. في انتظار الموافقة'; });
    } catch (e) {
      setState(() { _msg = 'حدث خطأ. حاول مرة أخرى'; });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل حساب')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(decoration: const InputDecoration(labelText: 'الاسم الكامل'), onSaved: (v) => _data['fullName'] = v ?? '', validator: (v) => v!.isEmpty ? 'مطلوب' : null),
              TextFormField(decoration: const InputDecoration(labelText: 'اسم المستخدم'), onSaved: (v) => _data['username'] = v ?? '', validator: (v) => v!.isEmpty ? 'مطلوب' : null),
              TextFormField(decoration: const InputDecoration(labelText: 'الرقم القومي/شهادة الميلاد'), onSaved: (v) => _data['nationalId'] = v ?? '', validator: (v) => v!.isEmpty ? 'مطلوب' : null),
              TextFormField(decoration: const InputDecoration(labelText: 'هاتف الطالب'), onSaved: (v) => _data['studentPhone'] = v ?? '', validator: (v) => v!.isEmpty ? 'مطلوب' : null),
              TextFormField(decoration: const InputDecoration(labelText: 'هاتف ولي الأمر'), onSaved: (v) => _data['parentPhone'] = v ?? '', validator: (v) => v!.isEmpty ? 'مطلوب' : null),
              TextFormField(decoration: const InputDecoration(labelText: 'المرحلة التعليمية'), onSaved: (v) => _data['stage'] = v ?? '', validator: (v) => v!.isEmpty ? 'مطلوب' : null),
              TextFormField(decoration: const InputDecoration(labelText: 'العمر'), keyboardType: TextInputType.number, onSaved: (v) => _data['age'] = v ?? '', validator: (v) => v!.isEmpty ? 'مطلوب' : null),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'المركز'),
                items: _centers.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (_) {},
                onSaved: (v) => _data['center'] = v ?? '',
                validator: (v) => (v == null || v.isEmpty) ? 'مطلوب' : null,
              ),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _loading ? null : _submit, child: _loading ? const CircularProgressIndicator() : const Text('إرسال')),
              if (_msg != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_msg!)),
            ],
          ),
        ),
      ),
    );
  }
}

