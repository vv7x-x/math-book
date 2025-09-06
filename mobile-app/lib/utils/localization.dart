import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_strings.dart';

class LocalizationProvider extends ChangeNotifier {
  Locale _locale = const Locale('ar');

  Locale get locale => _locale;
  Map<String, String> get strings => AppStrings.localized[_locale.languageCode] ?? AppStrings.localized['ar']!;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _locale = Locale(prefs.getString('lang') ?? 'ar');
    notifyListeners();
  }

  Future<void> toggle() async {
    final prefs = await SharedPreferences.getInstance();
    _locale = _locale.languageCode == 'ar' ? const Locale('en') : const Locale('ar');
    await prefs.setString('lang', _locale.languageCode);
    notifyListeners();
  }
}

