class LessonModel {
  final String id;
  final String subject;
  final int date; // epoch ms
  final String center;

  LessonModel({required this.id, required this.subject, required this.date, required this.center});

  factory LessonModel.fromMap(Map<String, dynamic> map) => LessonModel(
    id: map['id'] ?? '',
    subject: map['subject'] ?? '',
    date: (map['date'] ?? 0) as int,
    center: map['center'] ?? '',
  );
}

