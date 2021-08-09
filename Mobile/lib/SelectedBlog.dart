class SelectedBlog {
  final String blogUrl;
  final bool isSelected;

  SelectedBlog({required this.blogUrl, required this.isSelected});

  factory SelectedBlog.fromJson(Map<String, dynamic> json) {
    return SelectedBlog(
      blogUrl: json['blogUrl'],
      isSelected: json['isSelected'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'blogUrl': blogUrl,
      'isSelected': isSelected,
    };
  }
}
