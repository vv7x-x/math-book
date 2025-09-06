class StudentModel {
  final String id;
  final String fullName;
  final String username;
  final String center;
  final String status;

  StudentModel({required this.id, required this.fullName, required this.username, required this.center, required this.status});

  factory StudentModel.fromMap(Map<String, dynamic> map) => StudentModel(
    id: map['id'] ?? '',
    fullName: map['fullName'] ?? '',
    username: map['username'] ?? '',
    center: map['center'] ?? '',
    status: map['status'] ?? '',
  );

  Map<String, dynamic> toMap() => {
    'id': id,
    'fullName': fullName,
    'username': username,
    'center': center,
    'status': status,
  };
}

