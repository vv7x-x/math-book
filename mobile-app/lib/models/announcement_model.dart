class AnnouncementModel {
  final String id;
  final String title;
  final String message;
  final int createdAt;

  AnnouncementModel({required this.id, required this.title, required this.message, required this.createdAt});

  factory AnnouncementModel.fromMap(Map<String, dynamic> map) => AnnouncementModel(
    id: map['id'] ?? '',
    title: map['title'] ?? '',
    message: map['message'] ?? '',
    createdAt: (map['createdAt'] ?? 0) as int,
  );
}

